"use client";

import { useState } from "react";

const MOCK_DOCUMENTS = [
  { name: "Business License.pdf", type: "pdf", size: "2.4 MB", status: "verified" },
  { name: "Vet Certification.jpg", type: "image", size: "1.1 MB", status: "pending" },
  { name: "Tax Registration.pdf", type: "pdf", size: "856 KB", status: "pending" },
  { name: "Insurance Policy.pdf", type: "pdf", size: "3.2 MB", status: "pending" },
  { name: "Facility Photos.zip", type: "archive", size: "5.7 MB", status: "pending" },
];

export function ProviderDocumentViewer() {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Provider Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-xl">
              P
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                PetCare Spa & Clinic
              </h3>
              <p className="text-sm text-gray-700">contact@petcare.com</p>
              <p className="text-sm text-gray-700">+84 28 3456 7890</p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
            Pending
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-800">
            <span className="font-semibold text-gray-900">Address:</span>{" "}
            456 Nguyen Hue Street, District 1, HCMC
          </p>
          <p className="text-sm text-gray-800 mt-1">
            <span className="font-semibold text-gray-900">Description:</span>{" "}
            Full-service pet grooming and veterinary clinic with 8 years of
            experience. Specializing in dog and cat care.
          </p>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Document List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Uploaded Documents
          </h4>
          <div className="space-y-2">
            {MOCK_DOCUMENTS.map((doc, index) => (
              <button
                key={index}
                onClick={() => setSelectedDocIndex(index)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedDocIndex === index
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      doc.type === "pdf"
                        ? "bg-red-50 text-red-600"
                        : doc.type === "image"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {doc.type === "pdf" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    ) : doc.type === "image" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.size}</p>
                  </div>
                  {doc.status === "verified" && (
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Document Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">
              Document Preview
            </h4>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              {selectedDocIndex === 1 ? (
                <div className="p-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Image Preview — Vet Certification.jpg
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    1200 × 800 px • 1.1 MB
                  </p>
                </div>
              ) : (
                <div className="p-8">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-700 font-medium">
                    PDF Preview —{" "}
                    {["Business License.pdf", "Tax Registration.pdf", "Insurance Policy.pdf"][selectedDocIndex] ?? "Document"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Preview available in viewer • Scroll to navigate
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}