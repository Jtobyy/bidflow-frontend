import NProgress from 'nprogress';
import 'nprogress/nprogress.css';


NProgress.setColor = (color) => {
  const style = document.createElement('style');
  style.textContent = `
    #nprogress .bar {
      background: ${color} !important;
    }
    #nprogress .spinner .spinner-icon {
      border-top-color: ${color};
      border-left-color: ${color};
    }
  `;
  document.body.appendChild(style);
};

NProgress.configure({ showSpinner: true });

export default NProgress;
