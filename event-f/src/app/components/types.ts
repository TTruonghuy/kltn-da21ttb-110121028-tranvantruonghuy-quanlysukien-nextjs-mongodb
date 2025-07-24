export interface EventFormData {
    title: string;
    description: string;
    houseNumber: string;
    ward: string;
    district: string;
    province: string;
    location: {
        houseNumber: string;
        ward: string;
        district: string;
        province: string;
    };
    image: File | null;
    event_type: string;

    noSale: boolean;
    isOnline?: boolean;
    sessions?: any [];
    ticketMode?: "area" | "seat" | "none";
    // nếu bạn vẫn dùng saleStartTime / saleEndTime thì khai báo thêm ở đây
}

export interface SessionData {
    start_time: string;
    end_time: string;
    tickets?: TicketData[]; // Optional nếu cần
}

export interface TicketData {
    ticketName: string;
    ticketPrice: number;
    ticketQuantity: number;
    minPerOrder: number;
    maxPerOrder: number;
    saleStartTime: string;
    saleEndTime: string;
    description_ticket: string;
    image_ticket: File | string |null;
}