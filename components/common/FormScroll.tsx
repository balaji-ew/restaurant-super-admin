import React from 'react';

const FormScroll = ({ children }: any) => {
  return (
    <div data-radix-scroll-area-root className="h-[calc(100dvh-11.5rem)] pe-3 -me-3 ">
      <div data-radix-scroll-area-viewport className="h-full overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
};

export default FormScroll;
