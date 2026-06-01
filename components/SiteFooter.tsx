export function SiteFooter() {
  return (
    <footer className="bg-background-primary border-t border-border-selector">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 py-8 flex flex-col gap-6 text-sm text-text-secondary">
        <p className="text-center">Проект РБК × Kokoc Group</p>
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2 md:text-right">
            <a href="mailto:pr@kokocgroup.ru" className="hover:text-text-primary">
              Email: pr@kokocgroup.ru
            </a>
            <a href="tel:+74953080110" className="hover:text-text-primary">
              Телефон: +7 (495) 30-80-110
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
