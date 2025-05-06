"use client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { TiTicket } from "react-icons/ti";

interface CreateTicketFormProps {
    formData: {
        ticketName: string;
        ticketPrice: number;
        ticketQuantity: number;
        minPerOrder: number;
        maxPerOrder: number;
        saleStartTime: string;
        saleEndTime: string;
    };
    onFormDataChange: (data: Partial<CreateTicketFormProps["formData"]>) => void;
    onBack: () => void;
    onSubmit: () => void;
}

export default function CreateTicketForm({ formData, onFormDataChange, onBack, onSubmit }: CreateTicketFormProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onFormDataChange({ [name]: value });
    };

    return (
        <form className="space-y-10">
            <h2 className="text-xl font-bold mb-4">Thông tin vé</h2>
            <div>
                <label htmlFor="ticketName" className="font-medium text-gray-700 mb-2">
                    <TiTicket className="mt-1 mr-[2px]" /> Tên vé
                </label>
                <Input
                    id="ticketName"
                    name="ticketName"
                    type="text"
                    value={formData.ticketName || ""} // Ensure default value
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="ticketPrice" className="font-medium text-gray-700 mb-2">
                    Giá vé
                </label>
                <Input
                    id="ticketPrice"
                    name="ticketPrice"
                    type="number"
                    value={formData.ticketPrice || 0} // Ensure default value
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="flex justify-between">
                <Button
                    type="button"
                    onClick={onBack}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 h-10 flex"
                >
                    Quay lại
                </Button>
                <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 h-10 flex"
                >
                    Hoàn tất
                </Button>
            </div>
        </form>
    );
}
