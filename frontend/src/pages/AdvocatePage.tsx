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
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { advocateAPI } from "../services/api";
import { Input } from "@/components/ui/input";
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
  const [cursor, setCursor] = useState<string[]>([""]);
  const [search, setSearch] = useState("");
  const pageSize = 5;

  useEffect(() => {
    console.log("Current cursor state:", cursor);
  }, [cursor])

  useEffect(() => {
    setCursor([""]);
    setPage(1);
  }, [search]);

  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      try {
        const data = await advocateAPI.getAll(
          cursor[page - 1],
          pageSize,
          search,
        );
        setAdvocates(data.data);
        const next_cursor = data.next_cursor ? data.next_cursor : "";
        // Only add next_cursor if it's different from the last one
        setCursor((prev) => {
          if (prev.length <= page && prev[prev.length - 1] !== next_cursor) {
            return [...prev, next_cursor];
          }
          return prev;
        });
      } catch (error) {
        console.error("Error fetching advocates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvocates();
  }, [page, search]);

  const onClick = () => {
    setSearch("")
  }
  return (
    <div className="relative z-10 flex flex-col min-h-screen bg-white my-10 p-10 rounded-2xl w-full min-w-[32rem] max-w-4xl mx-auto items-center">
      <div className="w-full min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Find an Advocate
            </h1>
            <p className="text-gray-600">
              Discover what our advocates can do for you
            </p>
          </div>
          <div className="mb-6 sticky top-0 z-50 bg-white gap-2 flex">
            <Input
              placeholder="Search Advocates"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              className="flex-1 h-10 rounded-l-md border border-gray-300 px-3"
            />
            <button onClick={onClick} className="bg-brand-green border border-brand-green hover:bg-brand-green-light rounded-lx text-white h-10 px-4">
              Clear
            </button>
          </div>
          {/* Advocate List Placeholder */}
          <div className="h-[600px] overflow-auto border border-gray-200 rounded">
          <div className="bg-white shadow-md rounded-lg p-6">
            {loading ? (
              <p className="text-gray-700 flex justify-center">Loading advocates...</p>
            ) : (
              advocates.length === 0 ?(
                <p className="text-gray-700 flex justify-center">No advocates found.</p>
              ) :
              advocates.map((advocate) => (
                <AdvocateItem
                  key={advocate.id}
                  id={advocate.id}
                  name={advocate.name}
                  email={advocate.email}
                  phone={"1234567890"}
                />
              ))
            )}
          </div>
        </div>
        </div>
        {/* Only show pagination if there are more than, e.g., 10 advocates */}
        {cursor.length > 1 && cursor[1] != "" && (
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
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {page - 1 > 1 && (
                  <div className="flex">
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        size="default"
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          setPage(1);
                        }}
                      >
                        {1}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </div>
                )}
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
                {cursor[page] != "" && (
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
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    size="default"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (cursor[page] != "") setPage(page + 1);
                    }}
                    aria-disabled={cursor[page] == ""}
                    className={
                      cursor[page] == "" ? "pointer-events-none opacity-50" : ""
                    }
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
function formatPhoneNumber(value: string) {
  // Remove all non-digit characters just in case
  const digits = value.replace(/\D/g, "");

  // Apply formatting based on length
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

interface AdvocateItemProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const AdvocateItem: React.FC<AdvocateItemProps> = ({ name, email, phone }) => {
  const navigate = useNavigate();
  const formattedPhone = phone ? formatPhoneNumber(phone) : null;

  return (
    <div className="border-b border-gray-200 py-4 grid grid-cols-2">
      <div className="col-span-1">
        <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
        <p className="text-gray-600">Email: {email}</p>
        {formattedPhone && <p className="text-gray-600">Phone: {formattedPhone}</p>}
        <button
          className="bg-slate-100 border border-gray-50 col-span-2"
          onClick={() => navigate("/schedule")}
        >
          Schedule an Appointment
        </button>
      </div>
    </div>
  );
};

export default AdvocatePage;
