import React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={joinClasses('flex items-center gap-2 disabled:opacity-50', containerClassName)}
    className={joinClasses('disabled:cursor-not-allowed', className)}
    {...props}
  />
));
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={joinClasses('flex items-center', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef(({ index, className, ...props }, ref) => {
  const context = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = context.slots[index];

  return (
    <div
      ref={ref}
      className={joinClasses(
        'relative flex h-12 w-11 items-center justify-center border-y border-r border-gray-300 bg-white text-base font-semibold first:rounded-l-lg first:border-l last:rounded-r-lg',
        isActive && 'z-10 border-primary-500 ring-1 ring-primary-200',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-pulse bg-gray-900" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" className={joinClasses('px-2 text-gray-400', className)} {...props}>—</div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
