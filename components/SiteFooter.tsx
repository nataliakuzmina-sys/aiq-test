export function SiteFooter() {
  return (
    <footer className="bg-background-primary border-t border-border-selector">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 py-8 flex flex-col gap-6 text-sm text-text-secondary">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="flex flex-col gap-3 items-start">
            <a
              href="https://kokocgroup.ru/?utm_source=aiq.kokocgroup.ru&utm_medium=internal&utm_campaign=aiq&utm_content=main_page"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kokoc Group — главная"
              className="inline-flex items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/kokoc-logo-text.svg"
                alt="KOKOC GROUP"
                width={297}
                height={52}
                className="h-6 md:h-8 w-auto"
              />
            </a>
            <a href="mailto:pr@kokocgroup.ru" className="hover:text-text-primary">
              Email: pr@kokocgroup.ru
            </a>
            <a href="tel:+74953080110" className="hover:text-text-primary">
              Телефон: +7 (495) 30-80-110
            </a>
          </div>
          <div className="flex flex-col gap-2 md:text-right">
            <a
              href="https://kokocgroup.ru/privacy/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-text-primary"
            >
              Политика обработки персональных данных
            </a>
            <a
              href="https://kokocgroup.ru/user_agreement/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-text-primary"
            >
              Оферта
            </a>
          </div>
        </div>
        <p className="text-center pt-2 border-t border-border-selector">
          © 2026 Kokoc Group
        </p>
      </div>
    </footer>
  );
}
