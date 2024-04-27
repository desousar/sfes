export default function log(data) {
  if (process.env.VUE_APP_ENV === 'development') {
    console.log(data);
  }
}
