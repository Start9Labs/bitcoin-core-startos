import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '28.4:45',
  releaseNotes: {
    en_US:
      'Fixed recurring Tor control port warnings. The StartOS Tor service still handles incoming and outgoing onion connections.',
    es_ES:
      'Se corrigieron los avisos recurrentes del puerto de control de Tor. El servicio Tor de StartOS sigue gestionando las conexiones onion entrantes y salientes.',
    de_DE:
      'Wiederkehrende Warnungen zum Tor-Kontrollport wurden behoben. Der Tor-Dienst von StartOS verwaltet weiterhin ein- und ausgehende Onion-Verbindungen.',
    pl_PL:
      'Usunięto powtarzające się ostrzeżenia o porcie kontrolnym Tor. Usługa Tor w StartOS nadal obsługuje przychodzące i wychodzące połączenia onion.',
    fr_FR:
      'Les avertissements répétés concernant le port de contrôle Tor ont été corrigés. Le service Tor de StartOS continue de gérer les connexions onion entrantes et sortantes.',
  },
  migrations: {
    up: async () => {},
    down: async () => {},
  },
})
