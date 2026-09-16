"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Plus, Pencil, Trash2, X, Save } from "lucide-react";

type Knowledge = {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
};

export default function ChatbotAdminPage() {
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchKnowledgeList();
  }, []);

  const fetchKnowledgeList = async () => {
    try {
      const res = await fetch("/api/admin/chatbot-knowledge");
      if (res.ok) {
        const data = await res.json();
        setKnowledgeList(data);
      }
    } catch (error) {
      console.error("Failed to fetch knowledge list", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (knowledge?: Knowledge) => {
    setMessage(null);
    if (knowledge) {
      setEditingId(knowledge.id);
      setTopic(knowledge.topic);
      setContent(knowledge.content);
    } else {
      setEditingId(null);
      setTopic("");
      setContent("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!topic.trim() || !content.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    
    try {
      const method = editingId ? "PUT" : "POST";
      const body = { id: editingId, topic, content };

      const res = await fetch("/api/admin/chatbot-knowledge", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
        await fetchKnowledgeList();
        setIsModalOpen(false);
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) return;

    try {
      const res = await fetch(`/api/admin/chatbot-knowledge?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchKnowledgeList();
      } else {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessage({ type: 'error', text: 'กรุณาอัปโหลดไฟล์ PDF เท่านั้น' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.warning) {
          setMessage({ type: 'error', text: data.warning });
          return;
        }

        setContent((prev) => prev + (prev ? "\n\n" : "") + data.text);
        if (!topic) setTopic(file.name.replace('.pdf', ''));
        setMessage({ type: 'success', text: `อ่านข้อความจากไฟล์ ${file.name} สำเร็จ` });
      } else {
        setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก PDF' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) return <div className="p-8">กำลังโหลด...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">คลังความรู้ AI Chatbot</h1>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={18} />
          เพิ่มชุดความรู้ใหม่
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-700 w-1/4">หัวข้อ (Topic)</th>
              <th className="p-4 font-semibold text-gray-700">ตัวอย่างเนื้อหา</th>
              <th className="p-4 font-semibold text-gray-700 w-32">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {knowledgeList.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  ยังไม่มีชุดความรู้ กดปุ่ม "เพิ่มชุดความรู้ใหม่" เพื่อเริ่มต้น
                </td>
              </tr>
            ) : (
              knowledgeList.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-900">{item.topic}</td>
                  <td className="p-4 text-gray-600 text-sm truncate max-w-xs">
                    {item.content.substring(0, 100)}...
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold">{editingId ? 'แก้ไขชุดความรู้' : 'เพิ่มชุดความรู้ใหม่'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {message && (
                <div className={`p-4 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">หัวข้อ (Topic)</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="เช่น ระเบียบการรับสมัคร, ค่าเทอมสาขา IT"
                  className="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-gray-700">เนื้อหาที่ต้องการให้ AI จดจำ</label>
                  <div>
                    <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border disabled:opacity-50"
                    >
                      <Upload size={14} />
                      {isUploading ? "ดึงข้อความ..." : "ดึงข้อความจากไฟล์ PDF"}
                    </button>
                  </div>
                </div>
                <textarea
                  className="w-full h-80 p-3 border rounded focus:ring focus:ring-blue-200 outline-none font-mono text-sm leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow flex items-center gap-2 font-medium disabled:opacity-50"
              >
                <Save size={18} />
                {isSaving ? "กำลังบันทึก..." : "บันทึกชุดความรู้"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
