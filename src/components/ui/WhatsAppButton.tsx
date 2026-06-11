export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5511987654321"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-2.5 px-4 py-3 group"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.104 1.522 5.831L0 24l6.332-1.501A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm.006 21.818a9.836 9.836 0 01-5.017-1.375l-.36-.213-3.732.884.929-3.63-.236-.371A9.834 9.834 0 012.18 12c0-5.426 4.413-9.836 9.822-9.836 5.408 0 9.82 4.41 9.82 9.836s-4.412 9.818-9.816 9.818z" />
      </svg>
      <span className="text-sm font-semibold overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        Fale conosco
      </span>
    </a>
  )
}
