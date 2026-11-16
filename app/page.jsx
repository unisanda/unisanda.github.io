import Link from 'next/link';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Mail } from 'lucide-react';
import { siDiscord, siTiktok, siX, siInstagram, siTwitch, siSteam } from 'simple-icons';
import ThemeToggle from './theme-toggle';
import LanguageToggle from './language-toggle';
import Text from './i18n-text';

const socialLinks = [
  { name: 'Discord', handle: 'Join the server', handleAr: 'انضم للسيرفر', href: 'https://discord.com/invite/73e4kubpmB', icon: siDiscord },
  { name: 'TikTok', handle: '@iunisanda', href: 'https://www.tiktok.com/@iunisanda', icon: siTiktok },
  { name: 'X', handle: '@unimohdx', href: 'https://x.com/unimohdx', icon: siX },
  { name: 'Instagram', handle: '@unisanda', href: 'https://www.instagram.com/unisanda/', icon: siInstagram },
  { name: 'Twitch', handle: 'unimohd', href: 'https://www.twitch.tv/unimohd', icon: siTwitch },
  { name: 'Steam', handle: 'iimohd', href: 'https://steamcommunity.com/id/iimohd/', icon: siSteam },
];

export default function Home() {
  return <div className="site-shell">
    <div className="site-container">
      <header className="site-header">
        <Link href="/" className="site-name" aria-label="Unisanda home">unisanda<span>.</span></Link>
        <nav aria-label="Main navigation"><Link href="/" className="nav-current" aria-current="page"><Text en="Links" ar="الروابط" /></Link><Link href="/reviews/"><Text en="Reviews" ar="المراجعات" /></Link><LanguageToggle /><ThemeToggle /></nav>
      </header>

      <main>
        <section className="intro" aria-labelledby="intro-title">
          <div className="logo-stage"><div className="animated-logo"><img src="/images/Logo.png" alt="Unisanda logo" /></div></div>
          <div className="intro-copy">
            <span className="overline"><Text en="ABOUT ME" ar="نبذة عني" /></span>
            <h1 id="intro-title" className="profile-name">MOHD <BadgeCheck size={25} fill="#1d9bf0" color="#fff" aria-label="Verified" /></h1>
            <p className="profile-handle">@UniMohdx</p>
            <p className="profile-bio"><span className="lang-en" lang="en">Gaming, Graphic Designer, Content Creator, Music, Movies and I also do Reviews.<br />EN/AR/URD | TikTok 50k | IG 25k | Indie Games Supporter · <a href="mailto:mohd@unisanda.com">mohd@unisanda.com</a></span><span className="lang-ar" lang="ar">ألعاب، مصمم جرافيك، صانع محتوى، موسيقى وأفلام، وأقدّم مراجعات أيضًا.<br />العربية / الإنجليزية / الأردية | تيك توك 50 ألف | إنستغرام 25 ألف | داعم للألعاب المستقلة · <a href="mailto:mohd@unisanda.com" dir="ltr">mohd@unisanda.com</a></span></p>
            <a href="#links" className="jump-link"><Text en="Explore links" ar="تصفح الروابط" /> <ArrowDownRight size={17} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="link-section" id="links" aria-labelledby="links-title"><div className="section-top"><span><Text en="01 / SOCIAL" ar="01 / التواصل" /></span><h2 id="links-title"><Text en="Find me online" ar="تواصل معي" /></h2></div>
          <div className="link-list">{socialLinks.map(({ name, handle, handleAr, href, icon }) => <a className="list-link" href={href} target="_blank" rel="noopener noreferrer" key={name}><span className="list-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d={icon.path} /></svg></span><span className="list-details"><strong className="link-name" dir="ltr">{name}</strong><span className="link-handle">{handleAr ? <Text en={handle} ar={handleAr} /> : <span dir="ltr">{handle}</span>}</span></span><ArrowUpRight className="list-arrow" size={18} aria-hidden="true" /></a>)}</div>
        </section>

        <section className="more-section" aria-label="Other links"><div className="section-top"><span><Text en="02 / MORE" ar="02 / المزيد" /></span><h2><Text en="Elsewhere" ar="روابط أخرى" /></h2></div><div className="more-links"><a href="mailto:mohd@unisanda.com"><Mail size={19} strokeWidth={1.8} aria-hidden="true" /><span><Text en="Email me" ar="راسلني" /></span><ArrowUpRight size={17} aria-hidden="true" /></a><a href="https://tip.dokan.sa/iimohd" target="_blank" rel="noopener noreferrer"><ArrowRight size={19} strokeWidth={1.8} aria-hidden="true" /><span><Text en="Support" ar="الدعم" /></span><ArrowUpRight size={17} aria-hidden="true" /></a></div></section>
      </main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} unisanda</span><span><Text en="Made on the internet." ar="صُنع على الإنترنت." /></span></footer>
    </div>
  </div>;
}
