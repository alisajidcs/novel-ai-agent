import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {title:'Novel AI Agent', description:'Explore character relationships in classic novels.'};

export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
