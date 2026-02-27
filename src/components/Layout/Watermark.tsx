const Watermark = () => (
  <div
    className="fixed left-1/2 -translate-x-1/2 pointer-events-none z-10 whitespace-nowrap italic"
    style={{ bottom: 68, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}
  >
    Made with ❤️ by Shahrukh
  </div>
);

export default Watermark;
