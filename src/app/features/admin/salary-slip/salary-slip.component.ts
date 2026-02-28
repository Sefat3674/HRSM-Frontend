import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SalarySlipService, SalarySlipDto } from '../../../core/services/salary-slip.service';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

// PDF libraries
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-salary-slip',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DecimalPipe, FormsModule],
  templateUrl: './salary-slip.component.html',
  styleUrls: ['./salary-slip.component.scss'],
})
export class SalarySlipComponent implements OnInit {

  salarySlips: SalarySlipDto[] = [];
  loading = false;
  noData = false;

  userId?: number;
  month?: number;
  year?: number;

  months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];

  constructor(
    private salaryService: SalarySlipService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(take(1))
      .subscribe(([params, queryParams]) => {
        const idParam = params.get('id');
        this.userId = idParam ? +idParam : undefined;

        const monthParam = queryParams.get('month');
        const yearParam = queryParams.get('year');
        this.month = monthParam ? +monthParam : undefined;
        this.year = yearParam ? +yearParam : undefined;

        if (this.userId !== undefined) {
          this.loadSalarySlips(this.userId, this.month, this.year);
        } else {
          this.salarySlips = [];
          this.noData = true;
        }
      });
  }

  loadSalarySlips(userId?: number, month?: number, year?: number) {
    this.loading = true;
    this.noData = false;
    this.salarySlips = [];

    this.salaryService.getSalarySlips(userId, month, year)
      .pipe(take(1))
      .subscribe({
        next: (res: SalarySlipDto[]) => {
          this.ngZone.run(() => {
            this.salarySlips = Array.isArray(res) ? res : [];
            this.loading = false;
            this.noData = this.salarySlips.length === 0;
          });
        },
        error: (err: HttpErrorResponse) => {
          this.ngZone.run(() => {
            console.error('Salary Slip API Error:', err.message);
            this.salarySlips = [];
            this.loading = false;
            this.noData = true;
          });
        }
      });
  }

  refreshSlips(month?: number, year?: number) {
    this.month = month ?? this.month;
    this.year = year ?? this.year;
    this.loadSalarySlips(this.userId, this.month, this.year);
  }

  parseDetails(details?: string): { title: string; amount: number }[] {
    if (!details) return [];
    return details.split(',').map(item => {
      const parts = item.split('(');
      const title = parts[0]?.trim() ?? '';
      const amount = Number(parts[1]?.replace(')', '').trim() ?? 0);
      return { title, amount };
    });
  }

  getMonthName(monthNumber?: number): string {
    const month = this.months.find(m => m.value === monthNumber);
    return month ? month.name : '';
  }

  downloadSlip(userId?: number) {
    const slip = this.salarySlips.find(s => s.userId === userId);
    if (!slip) return;

    const doc = new jsPDF();

    // Header with username and month/year
    doc.setFontSize(16);
    doc.text(`Salary Slip for ${slip.userName || 'Unknown User'}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Month: ${this.getMonthName(slip.salaryMonth)} / ${slip.salaryYear}`, 14, 28);

    // Earnings table
    (doc as any).autoTable({
      startY: 35,
      head: [['Earnings', 'Amount']],
      body: [
        ['Basic Salary', slip.basicSalary],
        ['House Rent', slip.houseRentAllowance],
        ['Medical', slip.medicalAllowance],
        ['Other', slip.otherAllowance]
      ]
    });

    let finalY = (doc as any).lastAutoTable.finalY + 5;

    // Bonus
    if (slip.bonusDetails) {
      const bonusRows = this.parseDetails(slip.bonusDetails).map(b => [b.title, b.amount]);
      bonusRows.push(['Total Bonus', slip.totalBonus]);
      (doc as any).autoTable({
        startY: finalY,
        head: [['Bonus', 'Amount']],
        body: bonusRows
      });
      finalY = (doc as any).lastAutoTable.finalY + 5;
    }

    // Deductions
    if (slip.deductionDetails) {
      const deductionRows = this.parseDetails(slip.deductionDetails).map(d => [d.title, d.amount]);
      deductionRows.push(['Total Deduction', slip.totalDeduction]);
      (doc as any).autoTable({
        startY: finalY,
        head: [['Deduction', 'Amount']],
        body: deductionRows
      });
      finalY = (doc as any).lastAutoTable.finalY + 5;
    }

    // Net Salary
    doc.setFontSize(14);
    doc.text(`Net Salary: ৳ ${slip.netSalary}`, 14, finalY + 10);

    doc.save(`SalarySlip_${slip.userName || slip.userId}_${slip.salaryMonth}_${slip.salaryYear}.pdf`);
  }
}