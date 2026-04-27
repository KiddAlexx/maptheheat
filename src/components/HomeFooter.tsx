import { Link } from 'react-router-dom';

function HomeFooter() {
  return (
    <footer className="flex h-14 items-center justify-between  bg-slate-950/80 px-4 sm:px-8">
      <div className="flex w-full items-center justify-between py-4 text-sm text-primary-50  sm:text-base">
        <span>© {new Date().getFullYear()} MapTheHeat</span>
        <span className="hidden xs:block">Built by the community 🔥</span>

        <div className="flex items-center gap-6">
          <Link to="/contact">Contact</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
