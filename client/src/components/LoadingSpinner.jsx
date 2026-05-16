export default function LoadingSpinner({ size = 'md' }) {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <div className="spinner" />
    </div>
  );
}
