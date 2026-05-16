import { PrivyProvider } from '@privy-io/react-auth';

export function AppProvider({ children }) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || 'demo-app-id'}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#00C9A7',
          logo: 'https://via.placeholder.com/40',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
