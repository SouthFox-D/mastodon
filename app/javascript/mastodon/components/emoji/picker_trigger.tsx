import { cloneElement, useCallback, useState } from 'react';

import type { Placement } from '@floating-ui/react-dom';

import type { OnEmojiPick } from '@/mastodon/components/emoji/picker';
import { EmojiDropdown } from '@/mastodon/components/emoji/picker';
import { Popover } from '@/mastodon/components/popover';
import { useToggle } from '@/mastodon/hooks/useToggle';

/**
 * Upstream's `EmojiPickerButton` always renders its own trigger button, but the
 * reaction buttons need a custom trigger, so this attaches the same
 * `EmojiDropdown` popover to a caller-provided button element.
 *
 * `onClick`, `disabled` and `aria-expanded` are injected into the given button.
 * The picked `emoji` is the raw `EmojiData`, with `native` filled in for custom
 * emojis (as `:shortcode:`), so `imageUrl` is still available.
 */
export const EmojiPickerTrigger = ({
  onPick,
  disabled,
  placement = 'top-start',
  button,
}: {
  onPick: OnEmojiPick;
  disabled?: boolean;
  placement?: Placement;
  button: React.ReactElement<React.ComponentPropsWithRef<'button'>>;
}) => {
  const [open, { onToggle, onFalse }] = useToggle();
  const [reference, setReference] = useState<HTMLElement | null>(null);

  const buttonOnClick = button.props.onClick;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      buttonOnClick?.(event);

      if (disabled) {
        return;
      }

      setReference(event.currentTarget);
      onToggle();
    },
    [buttonOnClick, disabled, onToggle],
  );

  return (
    <>
      {cloneElement(button, {
        onClick: handleClick,
        disabled,
        'aria-expanded': open,
      })}

      <Popover
        isOpen={open}
        onClose={onFalse}
        reference={reference}
        placement={placement}
        offset={4}
      >
        {({ props, placement: popoverPlacement }) => (
          <EmojiDropdown
            onPick={onPick}
            onClose={onFalse}
            className={popoverPlacement}
            disabled={disabled}
            {...props}
          />
        )}
      </Popover>
    </>
  );
};
