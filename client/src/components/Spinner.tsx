function Spinner() {
    return (  
       <div className="h-[200px] grid place-content-center">
         <svg
          className="h-10 w-10 text-blue-500 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <circle cx="50" cy="10" r="6" />
          <circle cx="80" cy="20" r="6" opacity="0.8" />
          <circle cx="90" cy="50" r="6" opacity="0.6" />
          <circle cx="80" cy="80" r="6" opacity="0.4" />
          <circle cx="50" cy="90" r="6" opacity="0.2" />
          <circle cx="20" cy="80" r="6" opacity="0.4" />
          <circle cx="10" cy="50" r="6" opacity="0.6" />
          <circle cx="20" cy="20" r="6" opacity="0.8" />
        </svg>
       </div>
    );
}

export default Spinner;