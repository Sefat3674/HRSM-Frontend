import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SalarySlipService, SalarySlipDto } from '../../../core/services/salary-slip.service';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

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
  loading  = false;
  noData   = false;
  isBrowser = false;

  userId?: number;
  month?:  number;
  year?:   number;

  months = [
    { value: 1,  name: 'January'   }, { value: 2,  name: 'February'  },
    { value: 3,  name: 'March'     }, { value: 4,  name: 'April'     },
    { value: 5,  name: 'May'       }, { value: 6,  name: 'June'      },
    { value: 7,  name: 'July'      }, { value: 8,  name: 'August'    },
    { value: 9,  name: 'September' }, { value: 10, name: 'October'   },
    { value: 11, name: 'November'  }, { value: 12, name: 'December'  },
  ];

  constructor(
    private salaryService: SalarySlipService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.isBrowser = true;
        combineLatest([this.route.paramMap, this.route.queryParamMap])
          .pipe(take(1))
          .subscribe(([params, queryParams]) => {
            const idParam    = params.get('id');
            this.userId      = idParam ? +idParam : undefined;
            this.month       = queryParams.get('month') ? +queryParams.get('month')! : undefined;
            this.year        = queryParams.get('year')  ? +queryParams.get('year')!  : undefined;

            if (this.userId !== undefined) {
              this.loadSalarySlips(this.userId, this.month, this.year);
            } else {
              this.noData = true;
            }
            this.cdr.markForCheck();
          });
      });
    }
  }

  // ── Navigation ───────────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/admin/preview-payroll'], {
      queryParams: { month: this.month ?? null, year: this.year ?? null }
    });
  }

  printSlip(): void {
    window.print();
  }

  // ── Data Loading ─────────────────────────────────────────────
  loadSalarySlips(userId?: number, month?: number, year?: number): void {
    this.loading      = true;
    this.noData       = false;
    this.salarySlips  = [];

    if (!this.isBrowser) { this.loading = false; this.noData = true; return; }

    this.salaryService.getSalarySlips(userId, month, year)
      .pipe(take(1))
      .subscribe({
        next: (res: SalarySlipDto[]) => {
          this.salarySlips = Array.isArray(res) ? [...res] : [];
          this.loading     = false;
          this.noData      = this.salarySlips.length === 0;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Salary Slip API Error:', err.message);
          this.loading = false;
          this.noData  = true;
          this.cdr.markForCheck();
        }
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  parseDetails(details?: string): { title: string; amount: number }[] {
    if (!details) return [];
    return details.split(',').map(item => {
      const parts = item.split('(');
      return {
        title:  parts[0]?.trim() ?? '',
        amount: Number(parts[1]?.replace(')', '').trim() ?? 0)
      };
    });
  }

  getMonthName(monthNumber?: number): string {
    return this.months.find(m => m.value === monthNumber)?.name ?? '';
  }

  // ── PDF Download ──────────────────────────────────────────────
  downloadSlip(userId?: number): void {
    const slip = this.salarySlips.find(s => s.userId === userId);
    if (!slip) return;

    const doc       = new jsPDF();
    const monthName = this.getMonthName(slip.salaryMonth);

    // ── Header band
    doc.setFillColor(10, 14, 26);
    doc.rect(0, 0, 210, 42, 'F');
    doc.setFillColor(0, 201, 167);
    doc.rect(0, 40, 210, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('HR Payroll System', 14, 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(120, 140, 170);
    doc.text('Official Salary Document', 14, 25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 201, 167);
    doc.text(`${monthName} ${slip.salaryYear}`, 196, 22, { align: 'right' });

    // ── Employee info row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(10, 14, 26);
    doc.text(slip.userName || 'Employee', 14, 56);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110, 127, 158);
    doc.text(`Employee ID: #${slip.userId}`, 14, 63);

    // Net pay aligned right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(110, 127, 158);
    doc.text('NET PAY', 196, 53, { align: 'right' });
    doc.setFontSize(16);
    doc.setTextColor(0, 158, 132);
    doc.text(`\u09F3 ${slip.netSalary?.toLocaleString() ?? '0'}`, 196, 63, { align: 'right' });

    doc.setDrawColor(221, 227, 240);
    doc.setLineWidth(0.4);
    doc.line(14, 68, 196, 68);

    // ── Earnings table
    (doc as any).autoTable({
      startY: 74,
      head: [['Earnings', 'Amount (BDT)']],
      body: [
        ['Basic Salary',         slip.basicSalary?.toLocaleString()       ?? '0'],
        ['House Rent Allowance', slip.houseRentAllowance?.toLocaleString() ?? '0'],
        ['Medical Allowance',    slip.medicalAllowance?.toLocaleString()   ?? '0'],
        ['Transport Allowance',  slip.transportAllowance?.toLocaleString() ?? '0'],
        ['Other Allowance',      slip.otherAllowance?.toLocaleString()     ?? '0'],
      ],
      headStyles:         { fillColor: [28, 43, 74],  textColor: 255,              fontStyle: 'bold', fontSize: 10 },
      bodyStyles:         { fontSize: 10, textColor: [10, 14, 26] },
      columnStyles:       { 1: { halign: 'right' } },
      alternateRowStyles: { fillColor: [244, 246, 251] },
      margin:             { left: 14, right: 14 },
    });

    let nextY: number = (doc as any).lastAutoTable.finalY + 8;

    // ── Bonus table
    if (slip.bonusDetails) {
      const bonusRows = [
        ...this.parseDetails(slip.bonusDetails).map(b => [b.title, b.amount.toLocaleString()]),
        ['Total Bonus', slip.totalBonus?.toLocaleString() ?? '0'],
      ];
      (doc as any).autoTable({
        startY: nextY,
        head: [['Bonus Details', 'Amount (BDT)']],
        body: bonusRows,
        headStyles:         { fillColor: [0, 125, 87],  textColor: 255, fontStyle: 'bold', fontSize: 10 },
        bodyStyles:         { fontSize: 10, textColor: [10, 14, 26] },
        columnStyles:       { 1: { halign: 'right' } },
        alternateRowStyles: { fillColor: [240, 253, 247] },
        margin:             { left: 14, right: 14 },
      });
      nextY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ── Deduction table
    if (slip.deductionDetails) {
      const dedRows = [
        ...this.parseDetails(slip.deductionDetails).map(d => [d.title, `- ${d.amount.toLocaleString()}`]),
        ['Total Deduction', `- ${slip.totalDeduction?.toLocaleString() ?? '0'}`],
      ];
      (doc as any).autoTable({
        startY: nextY,
        head: [['Deductions', 'Amount (BDT)']],
        body: dedRows,
        headStyles:         { fillColor: [180, 28, 28], textColor: 255, fontStyle: 'bold', fontSize: 10 },
        bodyStyles:         { fontSize: 10, textColor: [10, 14, 26] },
        columnStyles:       { 1: { halign: 'right' } },
        alternateRowStyles: { fillColor: [255, 247, 247] },
        margin:             { left: 14, right: 14 },
      });
      nextY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ── Net salary footer band
    doc.setFillColor(10, 14, 26);
    doc.roundedRect(14, nextY, 182, 20, 5, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(120, 140, 175);
    doc.text('TOTAL NET SALARY', 22, nextY + 13);

    doc.setFontSize(14);
    doc.setTextColor(0, 201, 167);
    doc.text(`\u09F3 ${slip.netSalary?.toLocaleString() ?? '0'}`, 192, nextY + 13, { align: 'right' });

    // ── Footer note
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(168, 180, 204);
    doc.text('This is a system-generated salary slip and does not require a signature.', 14, nextY + 34);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')}`, 196, nextY + 34, { align: 'right' });

    doc.save(`SalarySlip_${slip.userName ?? slip.userId}_${monthName}_${slip.salaryYear}.pdf`);
  }
}