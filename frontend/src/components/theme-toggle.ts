import { customElement } from 'aurelia'

@customElement({
  name: 'theme-toggle',
  template: `
    <button
      class="rounded-md p-2 transition-colors hover:bg-muted text-foreground"
      aria-label="Alternar tema"
      click.trigger="toggleTheme()"
    >
      <!-- mostra Sol quando estiver dark -->
      <svg if.bind="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
      </svg>

      <!-- mostra Lua quando estiver light -->
      <svg else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path>
      </svg>
    </button>
  `
})
export class ThemeToggle {
  isDark = false

  binding() {
    // inicializa tema a partir do localStorage ou prefers-color-scheme
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored ? stored === 'dark' : prefersDark

    this.isDark = dark
    document.documentElement.classList.toggle('dark', dark)
  }

  toggleTheme() {
    this.isDark = !this.isDark
    document.documentElement.classList.toggle('dark', this.isDark)
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
  }
}
