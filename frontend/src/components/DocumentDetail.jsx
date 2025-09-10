import React, { useEffect, useState } from "react";

const DocumentDetail = ({ id, onClose }) => {
  const [doc, setDoc] = useState(null);
  const token = localStorage.getItem("token");

  const fetchDetail = async () => {
    const res = await fetch(`http://localhost:3000/documents/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setDoc(data.data);
  };

  const processDoc = async () => {
    const res = await fetch(`http://localhost:3000/documents/${id}/process`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      alert("Document processed!");
      fetchDetail();
    } else {
      alert(data.message || "Failed to process document");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (!doc) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded max-w-2xl w-full overflow-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">{doc.document.title}</h2>
        <p className="text-sm mb-4">{doc.document.text || "(No text stored)"}</p>
        {doc.summary && (
          <div className="mb-4">
            <h3 className="font-semibold">Summary</h3>
            <p>{doc.summary.summary_en}</p>
          </div>
        )}
        {doc.tasks?.length > 0 && (
          <div>
            <h3 className="font-semibold">Tasks</h3>
            <ul className="list-disc ml-5">
              {doc.tasks.map((t) => (
                <li key={t.id}>{t.title} — {t.status}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={processDoc} className="px-3 py-1 bg-blue-500 text-white rounded">
            Process
          </button>
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
