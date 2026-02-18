import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService, Attendance } from '../../../core/services/attendance.service';


export type AttendanceStatus = 'present' | 'late' | 'absent' | 'empty';

export interface CalendarDay {
  date: Date;
  status: AttendanceStatus;
  row?: number;    // day of the week (1-7)
  col?: number;    // week index (0-based)
}

@Component({
  selector: 'app-attendance-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-calendar.component.html',
  styleUrls: ['./attendance-calendar.component.scss']
})
export class AttendanceCalendarComponent implements OnInit, OnChanges {

  @Input() userId?: number;

  calendarWeeks: CalendarDay[][] = [];
  monthLabels: { month: string; weekIndex: number }[] = [];

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    // Initial load if userId is already available
    if (this.userId) {
      this.loadCalendar(this.userId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload calendar whenever userId changes
    if (changes['userId'] && this.userId) {
      this.loadCalendar(this.userId);
    }
  }

  private loadCalendar(userId: number): void {
    this.attendanceService.getAttendanceByUserId(userId)
      .subscribe({
        next: records => this.generateCalendar(records),
        error: err => {
          console.error('Failed to load attendance records', err);
          this.generateCalendar([]); // fallback to empty
        }
      });
  }

  private generateCalendar(records: Attendance[]): void {
    const today = new Date();

    // Start exactly 1 year ago, first day of month
    const start = new Date(today);
    start.setFullYear(today.getFullYear() - 1);
    start.setMonth(today.getMonth());
    start.setDate(1);

    // End = today aligned to Saturday
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));

    // Map attendance records by date
    const recordMap = new Map<string, AttendanceStatus>();
    records.forEach(r => {
      const key = new Date(r.date).toISOString().split('T')[0];
      recordMap.set(key, r.status.toLowerCase() as AttendanceStatus);
    });

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    let currentMonth = -1;
    const months: { month: string; weekIndex: number }[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().split('T')[0];
      const status = recordMap.get(iso) || 'empty';

      const day: CalendarDay = {
        date: new Date(d),
        status,
        row: d.getDay() + 1,  // Sun=1 ... Sat=7
        col: weeks.length      // column index (week)
      };

      currentWeek.push(day);

      // Week completed (Saturday)
      if (d.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      // Month label
      if (d.getMonth() !== currentMonth) {
        currentMonth = d.getMonth();
        months.push({
          month: d.toLocaleString('default', { month: 'short' }),
          weekIndex: weeks.length // align with week column
        });
      }
    }

    // Push last incomplete week
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Optional: remove leading empty days in first week
    const firstWeek = weeks[0];
    const firstRealIndex = firstWeek.findIndex(day => day.status !== 'empty');
    if (firstRealIndex > 0) {
      weeks[0] = firstWeek.slice(firstRealIndex);
    }

    this.calendarWeeks = weeks;
    this.monthLabels = months;
  }

  getStatusClass(status: AttendanceStatus) {
    return status;
  }
}