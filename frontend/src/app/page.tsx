"use client";

import { useState, useEffect } from "react";

type Problem = {
  id: string;
  name: string;
  description: string;
  grading_mode?: "strict" | "mock";
  test_case_count?: number;
};

type TestCaseResult = {
  test_case: number;
  status: string;
  time: string;
  actual_output: string;
  expected_output: string;
};

type GradeResponse = {
  status: string;
  passed: number;
  total: number;
  total_time: string;
  results: TestCaseResult[];
  message?: string;
};

export default function Home() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>("#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<GradeResponse | null>(null);

  useEffect(() => {
    // In dev, use absolute URL if needed, but relative should work in next.js with rewrites or just direct
    fetch(`${API_BASE}/api/problems`)
      .then(res => res.json())
      .then(data => {
        setProblems(data);
        if (data.length > 0) setActiveProblem(data[0]);
      })
      .catch(err => console.error("Error fetching problems:", err));
  }, []);

  const handleSubmit = async () => {
    if (!activeProblem) return;
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: activeProblem.id,
          code
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error submitting code:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="layout-container">
      <header className="header glass">
        <img src="/image/cedt.png" alt="CEDT Logo" style={{ width: '100px', height: '48px', marginRight: '0.8rem' }} />
        <h1>!! Fake Grader !!</h1>
        <div style={{ color: "var(--text-secondary)" }}>Computer Programming</div>
      </header>

      <main className="main-content">
        <aside className="sidebar glass">
          <div style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: "600" }}>Problems</div>
          {problems.map((prob) => (
            <div
              key={prob.id}
              className={`problem-card ${activeProblem?.id === prob.id ? 'active' : ''}`}
              onClick={() => {
                setActiveProblem(prob);
                setResult(null);
              }}
            >
              <div className="problem-title">{prob.name}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span>{prob.id}</span>
                <span style={{
                  fontSize: "0.7rem",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "4px",
                  background: prob.grading_mode === "strict" ? "rgba(76,175,80,0.15)" : "rgba(255,183,77,0.2)",
                  color: prob.grading_mode === "strict" ? "var(--success)" : "#e65100",
                }}>
                  {prob.grading_mode === "strict" ? "Strict" : "Mock"}
                </span>
              </div>
            </div>
          ))}
        </aside>

        <section className="editor-pane">
          <div className="code-area glass">
            {activeProblem && (
              <div style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--panel-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>{activeProblem.name}</h2>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    fontWeight: 600,
                    background: activeProblem.grading_mode === "strict" ? "rgba(76,175,80,0.15)" : "rgba(255,183,77,0.2)",
                    color: activeProblem.grading_mode === "strict" ? "var(--success)" : "#e65100",
                  }}>
                    {activeProblem.grading_mode === "strict"
                      ? `Strict · ${activeProblem.test_case_count ?? 0} tests`
                      : "Mock · compile only"}
                  </span>
                  <a
                    href={`${API_BASE}/api/files/${activeProblem.id}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-download"
                    style={{
                      background: "rgba(141, 110, 99, 0.1)",
                      color: "var(--text-primary)",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontWeight: "500",
                      border: "1px solid rgba(141, 110, 99, 0.3)",
                      transition: "all 0.2s"
                    }}
                  >
                    📄 Download PDF
                  </a>
                </div>
              </div>
            )}

            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />

            <div className="actions">
              {isSubmitting ? (
                <span className="loading-spinner"></span>
              ) : (
                <img
                  src="/image/ks.png"
                  alt="Submit"
                  className="btn-ks"
                  onClick={handleSubmit}
                  style={{
                    height: '150px',
                    cursor: activeProblem ? 'pointer' : 'not-allowed',
                    opacity: activeProblem ? 1 : 0.5,
                    transition: 'transform 0.2s ease, filter 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (activeProblem) { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.filter = 'brightness(1.1)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
                />
              )}
            </div>
          </div>

          <div className="output-pane glass animate-fade">
            <div className="output-header">Execution Results</div>

            {!result && !isSubmitting && (
              <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "2rem" }}>
                Submit your code to see results.
              </div>
            )}

            {result && (
              <div className="animate-fade">
                <div className="status-summary">
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Status</div>
                    <div className="status-value" style={{ color: result.status === "Accepted" ? "var(--success)" : "var(--error)" }}>
                      {result.status}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Test Cases</div>
                    <div className="status-value">{result.passed} / {result.total}</div>
                  </div>
                  {result.total_time && (
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Time</div>
                      <div className="status-value">{result.total_time}</div>
                    </div>
                  )}
                </div>

                {result.message && (
                  <div className="test-case fail">
                    <div className="test-case-title">Compilation Output</div>
                    <div className="detail-row">{result.message}</div>
                  </div>
                )}

                {result.results?.map((tc, idx) => (
                  <div key={idx} className={`test-case ${tc.status === 'Passed' ? 'pass' : 'fail'}`}>
                    <div className="test-case-title">
                      <span>Test Case {tc.test_case}</span>
                      <span className={tc.status === 'Passed' ? 'badge-pass' : 'badge-fail'}>{tc.status}</span>
                    </div>
                    <div className="detail-row"><strong>Time:</strong> {tc.time}</div>
                    {tc.status !== 'Passed' && (
                      <>
                        <div className="detail-row"><strong>Expected:</strong><br />{tc.expected_output}</div>
                        <div className="detail-row"><strong>Actual:</strong><br />{tc.actual_output}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
