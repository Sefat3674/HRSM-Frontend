import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService, Attendance } from '../../../core/services/attendance.service';
import { FormsModule } from '@angular/forms';
import { UserService,User  }  from '../../../core/services/user.service';

// 🔹 New interface for calendar table rows
interface CalendarDay {
  date: Date;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string | null;
}

@Component({
  selector: 'app-attendance-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-table.component.html',
  styleUrls: ['./attendance-table.component.scss']
})
export class AttendanceTableComponent implements OnInit {

  @Input() userId!: number;

  attendanceRecords: Attendance[] = [];
  calendarDays: CalendarDay[] = []; // Use this instead of Attendance[]

  selectedMonth: string = new Date().toISOString().slice(0, 7);
  weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 
  loading = false;
  error: string | null = null;
  searchTerm = '';

  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor(
  private attendanceService: AttendanceService,
  private userService: UserService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
  const user = this.userService.loadUser();

  if (!user) {
    this.error = 'User not logged in';
    return;
  }

  this.userId = user.userId;
  this.fetchAttendance();
}

  private fetchAttendance(): void {
  this.loading = true;

  this.attendanceService.getAttendanceByUserId(this.userId).subscribe({
    next: (data: Attendance[]) => {
      this.attendanceRecords = data;

      console.log('✅ Fetched attendance records:', this.attendanceRecords); // <-- log API data

      // Generate full month view
      this.generateCalendar();

      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.error = 'Failed to load attendance';
      this.loading = false;
    }
  });
}

  // 🔹 Filter Month
  filterByMonth(): void {
    this.generateCalendar();
  }

  // 🔹 Generate Full Month Calendar
  generateCalendar(): void {
    const [year, month] = this.selectedMonth.split('-').map(Number);

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    this.calendarDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);

      const attendance = this.attendanceRecords.find(a =>
        new Date(a.date).toDateString() === currentDate.toDateString()
      );

      this.calendarDays.push({
        date: currentDate,
        checkInTime: attendance?.checkInTime || null,
        checkOutTime: attendance?.checkOutTime || null,
        status: attendance?.status || null
      });
    }

    this.cdr.detectChanges();
  }

  // 🔹 Late / Early Highlight
  isLate(checkInTime: string | null): boolean {
    if (!checkInTime) return false;
    const [hours, minutes] = checkInTime.split(':').map(Number);
    return hours > 9 || (hours === 9 && minutes > 0);
  }

  isEarly(checkOutTime: string | null): boolean {
    if (!checkOutTime) return false;
    const [hours] = checkOutTime.split(':').map(Number);
    return hours < 17;
  }

// Add this inside your component class
getRowColor(record: CalendarDay): string {
  if (!record.status) return '#fdecea';       // No record
  switch (record.status) {
    case 'Present': return '#e6f4ea';         // Light green
    case 'Late': return '#fff4e5';            // Light orange
    case 'Absent': return '#fdecea';          // Light red
    default: return '#ffffff';
  }
}

// Convert "HH:mm" to "hh:mm AM/PM"
convertToAmPm(time: string | null): string {
  if (!time) return '-';
  const [hoursStr, minutesStr] = time.split(':');
  let hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}
  // 🔹 Search
  onSearch(): void {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      const term = this.searchTerm.toLowerCase().trim();

      if (term) {
        this.calendarDays = this.calendarDays.filter(record =>
          Object.values(record).some(val =>
            val?.toString().toLowerCase().includes(term)
          )
        );
      } else {
        this.generateCalendar();
      }

      this.cdr.detectChanges();
    }, 300);
  }
}