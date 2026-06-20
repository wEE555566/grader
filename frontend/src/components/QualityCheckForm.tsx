import React, { useState } from 'react';
import styles from './QualityCheckForm.module.css';

// Define the available quality check criteria
const criteriaList = [
  { id: 'clarity', label: 'ความชัดเจนของคำถาม' },
  { id: 'correctness', label: 'ความถูกต้องของคำตอบ' },
  { id: 'difficulty', label: 'ระดับความยาก' },
  { id: 'plagiarism', label: 'การคัดลอก/ลอกเลียนแบบ' },
  { id: 'formatting', label: 'รูปแบบและการจัดหน้า' },
  { id: 'curriculum', label: 'สอดคล้องกับหลักสูตร' },
];

export default function QualityCheckForm() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleOption = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) return;
    setSubmitting(true);
    // Placeholder: send to backend or just log
    console.log('Selected quality checks:', selected);
    // Simulate async operation
    await new Promise(r => setTimeout(r, 500));
    setSubmitting(false);
    alert('บันทึกการตรวจคุณภาพเรียบร้อย!');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        {criteriaList.map(item => (
          <label key={item.id} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggleOption(item.id)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={submitting || selected.length === 0}
      >
        {submitting ? 'กำลังบันทึก...' : 'ตรวจสอบ'}
      </button>
    </form>
  );
}
