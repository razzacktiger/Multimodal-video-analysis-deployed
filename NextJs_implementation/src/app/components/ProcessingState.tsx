
// Temporary placeholder - will be replaced with full component migration
export default function ProcessingState() {
  return (
    <div style={{ 
      padding: "20px", 
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #3498db",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }}></div>
      <p>Processing...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
