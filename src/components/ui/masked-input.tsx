'use client';

import * as React from 'react';
import { IMaskMixin } from 'react-imask';
import { type InputProps } from '@/components/ui/input';
import { Input } from '@/components/ui/input';

const MaskedInput = IMaskMixin(({ inputRef, ...props }: { inputRef: React.Ref<HTMLInputElement> } & InputProps) => (
  <Input
    {...props}
    ref={inputRef}
  />
));

export { MaskedInput };
