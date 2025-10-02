export default function MusicButton() {
    return (
          <div className="relative z-10" style={{ position: 'absolute', right: '16px', bottom: '16px' }}>
            <button aria-label="toggle sound" className="btn-neon" style={{ padding: '6px 10px' }}>
              🔊
            </button>
          </div>
    );
}