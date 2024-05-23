export default function log(...data) {
  if (import.meta.env.VITE_APP_ENV !== 'production') {
    console.log(...data);
  }
}
