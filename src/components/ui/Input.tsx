import { InputHTMLAttributes } from 'react';

export default function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-4 h-14 text-sm bg-[#E7E0EC] rounded-t-xl rounded-b-none border-0 border-b-2 border-[#79747E] outline-none placeholder:text-[#49454F]/60 text-[#1C1B1F] transition-colors duration-200 focus:border-[#6750A4] focus:bg-[#E7E0EC]/80 focus-visible:ring-0 ${className}`}
      {...props}
    />
  );
}
