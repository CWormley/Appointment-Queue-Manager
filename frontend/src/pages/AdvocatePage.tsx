/**
 * AdvocatePage
 * 
 * @description
 * Page component for displaying advocate information.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-25
 *
 */
import React, { useEffect, useState } from 'react';
import { advocateAPI } from '../services/api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
function AdvocatePage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [advocates, setAdvocates] = useState<AdvocateItemProps[]>([]);
    const [page, setPage] = useState<number>(1);
    const [cursor, setCursor] = useState<string[]>(['']);
    const [totalPages, setTotalPages] = useState<number>(1);
    const pageSize = 5;

    useEffect(() => {
        const fetchAdvocates = async () => {
            setLoading(true);
            try {
                const data = await advocateAPI.getAll(cursor[page-1], pageSize);
                setAdvocates(data.data);
                setTotalPages(data.totalCount / data.pageSize);
                if(cursor.length <= page){
                  setCursor(prev => [...prev, data.next_cursor]);
                }
            } catch (error) {
                console.error("Error fetching advocates:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAdvocates();
    }, [page]);

    return (
    <div className="relative z-10 flex flex-col min-h-screen bg-white my-10 p-10 rounded-2xl w-full min-w-[32rem] max-w-4xl mx-auto">
      <div className="w-full min-h-screen">

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find an Advocate</h1>
          <p className="text-gray-600">Discover what our advocates can do for you</p>
        </div>
        {/* Advocate List Placeholder */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {loading ? (
            <p className="text-gray-700">Loading advocates...</p>
          ) : (
            advocates.map((advocate) => (
              <AdvocateItem
                key={advocate.id}
                id={advocate.id}
                name={advocate.name}
                email={advocate.email}
                phone={advocate.phone}
              />
            ))
          )}    
        </div>
      </div>
      {/* Only show pagination if there are more than, e.g., 10 advocates */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  size="default"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {page > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    size="default"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      setPage(page - 1);
                    }}
                  >
                    {page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink href="#" isActive size="default">
                  {page.toString()}
                </PaginationLink>
              </PaginationItem>
              {page < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    size="default"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      setPage(page + 1);
                    }}
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              {page < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  size="default"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      </div>
    </div>
  );
}

interface AdvocateItemProps{
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const AdvocateItem: React.FC<AdvocateItemProps> = ({ name, email, phone }) => {
    return (
        <div className="border-b border-gray-200 py-4 grind-cols-2">
          <div className='col-span-1'>
            <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
            <p className="text-gray-600">Email: {email}</p>
            {phone && <p className="text-gray-600">Phone: {phone}</p>}
          </div>
            <button className='bg-slate-100 border border-gray-50 col-span-2'>
              Book With Advocate
            </button>
        </div>
    );
}

export default AdvocatePage;