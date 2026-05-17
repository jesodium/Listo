import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { UIProvider } from './UIProvider';

export function AppProvider({ children }) {
  return (
    <UIProvider>
      <PrivyProvider
        appId={import.meta.env.VITE_PRIVY_APP_ID || 'demo-app-id'}
        config={{
          loginMethods: ['email'],
          appearance: {
            theme: 'light',
            accentColor: '#00C9A7',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <SmartWalletsProvider
          config={{
            paymasterContext: {
              mode: 'SPONSORED',
            },
          }}
        >
          {children}
        </SmartWalletsProvider>
      </PrivyProvider>
    </UIProvider>
  );
}
