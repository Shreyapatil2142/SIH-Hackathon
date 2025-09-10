import React, { useState, useEffect } from "react";
import UploadDocumentModal from "./UploadDocumentModal";
import DocumentDetail from "./DocumentDetail";

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchDocuments = async () => {
    const res = await fetch(`http://localhost:3000/documents?search=${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setDocuments(data.data.documents || []);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    const res = await fetch(`http://localhost:3000/documents/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      alert("Deleted!");
      fetchDocuments();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search documents"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Upload Document
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Title</th>
            <th className="p-2">Created By</th>
            <th className="p-2">Created At</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="p-2">{doc.title}</td>
              <td className="p-2">{doc.created_by_name}</td>
              <td className="p-2">{new Date(doc.created_at).toLocaleString()}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => setSelectedDoc(doc.id)}
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showUploadModal && (
        <UploadDocumentModal onClose={() => { setShowUploadModal(false); fetchDocuments(); }} />
      )}
      {selectedDoc && (
        <DocumentDetail id={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
};

export default DocumentsList;
