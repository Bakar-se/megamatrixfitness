import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'floating-label';
  error?: boolean;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant = 'default',
      placeholder,
      error,
      helperText,
      leadingIcon,
      trailingIcon,
      value,
      defaultValue,
      labelClassName,
      containerClassName,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(() => {
      const initialValue = value ?? defaultValue ?? '';
      return String(initialValue).length > 0;
    });

    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const getFocusColor = () => {
      if (!className) return 'text-primary';
      const match = className.match(/focus-visible:border-([a-zA-Z0-9-]+)/);
      return match ? `text-${match[1]}` : 'text-primary';
    };

    // More robust autofill detection
    const checkForAutofill = React.useCallback(() => {
      if (!inputRef.current) return;

      const input = inputRef.current;
      const currentValue = input.value;

      // Check for autofill with error handling for unsupported selectors
      let isAutofilled = false;

      try {
        isAutofilled = input.matches(':autofill');
      } catch (e) {
        // :autofill not supported in this browser
      }

      if (!isAutofilled) {
        try {
          isAutofilled = input.matches(':-webkit-autofill');
        } catch (e) {
          // :-webkit-autofill not supported in this browser
        }
      }

      // Alternative detection: check if input has webkit-autofill styling
      if (!isAutofilled) {
        try {
          const computedStyle = window.getComputedStyle(input);
          // Chrome/Safari adds specific styling to autofilled inputs
          isAutofilled =
            computedStyle.getPropertyValue('-webkit-autofill') !== '' ||
            computedStyle.getPropertyValue('background-color') ===
              'rgb(232, 240, 254)' ||
            computedStyle.getPropertyValue('background-color') ===
              'rgb(250, 255, 189)';
        } catch (e) {
          // Fallback failed
        }
      }

      // Update hasValue if input has content or is autofilled
      if (currentValue.length > 0 || isAutofilled) {
        setHasValue(true);
      } else {
        setHasValue(false);
      }
    }, []);

    // Check for autofill on mount and with multiple methods
    React.useEffect(() => {
      if (!inputRef.current) return;

      const input = inputRef.current;

      // Check immediately
      checkForAutofill();

      // Use requestAnimationFrame for better timing
      const rafCheck = () => {
        checkForAutofill();
        requestAnimationFrame(rafCheck);
      };
      const rafId = requestAnimationFrame(rafCheck);

      // Stop RAF checking after 3 seconds
      const timeout = setTimeout(() => {
        cancelAnimationFrame(rafId);
      }, 3000);

      // Use MutationObserver to watch for attribute changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'attributes' &&
            (mutation.attributeName === 'value' ||
              mutation.attributeName === 'class')
          ) {
            checkForAutofill();
          }
        });
      });

      observer.observe(input, {
        attributes: true,
        attributeFilter: ['value', 'class']
      });

      // Also check with intervals at different timings
      const intervals = [
        setInterval(checkForAutofill, 50), // Quick checks
        setInterval(checkForAutofill, 200), // Medium checks
        setInterval(checkForAutofill, 500) // Slower checks
      ];

      // Clean up after 5 seconds
      const cleanupTimeout = setTimeout(() => {
        intervals.forEach(clearInterval);
        observer.disconnect();
      }, 5000);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeout);
        clearTimeout(cleanupTimeout);
        intervals.forEach(clearInterval);
        observer.disconnect();
      };
    }, [checkForAutofill]);

    // Handle controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setHasValue(String(value).length > 0);
      }
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Check for autofill on focus as well
      setTimeout(checkForAutofill, 0);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Check for autofill on blur as well
      setTimeout(checkForAutofill, 0);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      onChange?.(e);
    };

    const inputClasses = cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-radius border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50',
      error &&
        'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50',
      leadingIcon && 'pl-9',
      trailingIcon && 'pr-9',
      className,
      !error && hasValue && variant === 'floating-label' && 'border-green-400'
    );

    const iconClasses = cn(
      'absolute top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer',
      error && 'text-destructive'
    );

    if (variant === 'floating-label') {
      const labelClasses = cn(
        'absolute left-3 transition-all duration-200 pointer-events-none bg-transparent',
        'text-muted-foreground',
        (isFocused || hasValue) &&
          `text-xs -top-4 bg-background px-1 left-1 ${getFocusColor()}`,
        labelClassName,
        !isFocused && !hasValue && 'text-sm top-2.5',
        error && !isFocused && !hasValue && 'text-destructive',
        leadingIcon && 'left-9',
        !error && hasValue && variant === 'floating-label' && 'text-green-400'
      );

      return (
        <div className={cn('relative', containerClassName)}>
          {leadingIcon && (
            <div className={cn(iconClasses, 'top-4.5 left-3')}>
              {leadingIcon}
            </div>
          )}
          <input
            ref={inputRef}
            type={type}
            data-slot='input'
            className={inputClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            value={value}
            defaultValue={defaultValue}
            {...props}
          />
          {trailingIcon && (
            <div className={cn(iconClasses, 'right-3')}>{trailingIcon}</div>
          )}
          {placeholder && <label className={labelClasses}>{placeholder}</label>}
          {helperText && error && (
            <p
              className={cn(
                'text-sm',
                error ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className={cn('relative', containerClassName)}>
        {leadingIcon && (
          <div className={cn(iconClasses, 'top-4.5 left-3')}>{leadingIcon}</div>
        )}
        <input
          ref={inputRef}
          type={type}
          data-slot='input'
          className={inputClasses}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          {...props}
        />
        {trailingIcon && (
          <div className={cn(iconClasses, 'right-3')}>{trailingIcon}</div>
        )}
        {helperText && error && (
          <p
            className={cn(
              'text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
