'use client';

import * as React from 'react';
import { IMaskMixin } from 'react-imask';
import { Input } from '@/components/ui/input';

const MaskedInput = IMaskMixin(({ inputRef, ...props }: { inputRef: React.Ref<HTMLInputElement> } & React.ComponentProps<'input'>) => (
  <Input
    {...props}
    ref={inputRef}
  />
));

export { MaskedInput };
