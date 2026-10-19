export declare function helsinkiToday(now?: Date): string;
export declare function validCalendarDate(date: string): boolean;
export declare function addCalendarDays(date: string, days: number): string;
export declare function isBookableStart(date: string, time: string, now?: Date): boolean;
export declare function bookingSlots(date: string, now?: Date): string[];
