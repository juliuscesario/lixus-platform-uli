import React from 'react';

// Komponen untuk merender tombol paginasi
export default function Pagination({ meta, links, onPageChange }) {
    // Jangan tampilkan paginasi jika hanya ada satu halaman atau tidak ada data
    if (!meta || !meta.links || meta.links.length <= 3) {
        return null;
    }

    return (
        <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-10">
            {/* Tombol Previous */}
            <div className="flex w-0 flex-1">
                <button
                    onClick={() => onPageChange(links.prev)}
                    disabled={!links.prev}
                    className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                    <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                    Previous
                </button>
            </div>

            {/* Nomor Halaman */}
            <div className="hidden md:-mt-px md:flex">
                {meta.links.map((link) => {
                    if (link.label.includes('Previous') || link.label.includes('Next')) {
                        return null; // Skip "Previous" & "Next" labels from the middle
                    }
                    return (
                        <button
                            key={link.label} // Gunakan key yang lebih stabil
                            onClick={() => onPageChange(link.url)}
                            disabled={!link.url}
                            className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                                link.active
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } ${!link.url ? 'text-gray-300 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>

            {/* Tombol Next */}
            <div className="flex w-0 flex-1 justify-end">
                <button
                    onClick={() => onPageChange(links.next)}
                    disabled={!links.next}
                    className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                    Next
                    <svg className="ml-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </nav>
    );
}
