import { motion } from 'motion/react';
import { CheckCircle, Download, X } from 'lucide-react';
import { Booking } from '../types';

interface InvoiceProps {
  booking: Booking;
  onClose: () => void;
}

export function Invoice({ booking, onClose }: InvoiceProps) {
  const handleDownload = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:max-w-none print:rounded-none"
      >
        <div className="p-6 text-center border-b border-gray-100 flex justify-between items-center print:hidden">
            <div className="w-10" /> {/* Spacer */}
            <h2 className="text-xl font-bold text-gray-800">রসিদ / Invoice</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
            </button>
        </div>

        <div id="invoice-content" className="p-8 space-y-6">
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">বুকিং কনফার্ম!</h3>
            <p className="text-gray-500 text-sm">আপনার রিকোয়েস্টটি পেন্ডিং আছে।</p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">ইউজার আইডি</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{booking.userId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">নাম</span>
              <span className="font-semibold">{booking.userName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">টিম সদস্য</span>
              <span className="font-semibold">{booking.selectedMemberName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">টাকার পরিমাণ</span>
              <span className="font-bold text-green-600">৳{booking.amount}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">পেমেন্ট মেথড</span>
              <span className="font-semibold">{booking.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">হোয়াটসঅ্যাপ</span>
              <span className="font-semibold">{booking.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">তারিখ</span>
              <span className="text-sm font-medium">{new Date().toLocaleString('bn-BD')}</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-blue-700 text-xs leading-relaxed">
              অনুগ্রহ করে এই ইনভয়েসটির একটি স্ক্রিনশট নিন অথবা সেভ করে রাখুন। এডমিন যাচাই করার পর আপনার সিট কনফার্ম হবে।
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t print:hidden flex gap-4">
          <button
            onClick={handleDownload}
            className="flex-1 bg-white border border-gray-300 py-3 rounded-xl font-bold text-gray-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            সেভ করুন
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-white active:scale-95 transition-transform"
          >
            ঠিক আছে
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
