import { useCallback, useMemo, useState } from 'react';
import type { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import type { AnimatedProps } from '@react-spring/web';
import { animated, useTransition } from '@react-spring/web';

import { addReaction, removeReaction } from '@/mastodon/actions/interactions';
import type { ApiStatusReactionJSON } from '@/mastodon/api_types/statuses';
import { AnimatedNumber } from '@/mastodon/components/animated_number';
import { Emoji } from '@/mastodon/components/emoji';
import { useIdentity } from '@/mastodon/identity_context';
import {
  autoPlayGif,
  maxReactions,
  reduceMotion,
} from '@/mastodon/initial_state';
import { useAppDispatch } from '@/mastodon/store';

interface Props {
  statusId: string;
  reactions?: ApiStatusReactionJSON[];
  numVisible?: number;
  className?: string;
}

export const StatusReactionsBar: FC<Props> = ({
  statusId,
  reactions,
  numVisible,
  className,
}) => {
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();

  const visibleReactions = useMemo(() => {
    const visible = (reactions ?? [])
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);

    if (numVisible !== undefined && numVisible >= 0) {
      return visible.slice(0, numVisible);
    }

    return visible;
  }, [reactions, numVisible]);

  const canAddReaction =
    signedIn &&
    (reactions?.filter((reaction) => reaction.me).length ?? 0) < maxReactions;

  const handleAddReaction = useCallback(
    (name: string, url?: string) => {
      dispatch(addReaction(statusId, name, url));
    },
    [dispatch, statusId],
  );

  const handleRemoveReaction = useCallback(
    (name: string) => {
      dispatch(removeReaction(statusId, name));
    },
    [dispatch, statusId],
  );

  const transitions = useTransition(visibleReactions, {
    from: { scale: 0 },
    enter: { scale: 1 },
    leave: { scale: 0 },
    immediate: reduceMotion,
    keys: visibleReactions.map((x) => x.name),
  });

  if (visibleReactions.length === 0) {
    return null;
  }

  return (
    <div className={classNames('reactions-bar', className)}>
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.name}
          reaction={reaction}
          canAddReaction={canAddReaction}
          onAdd={handleAddReaction}
          onRemove={handleRemoveReaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
        />
      ))}
    </div>
  );
};

interface ReactionProps {
  reaction: ApiStatusReactionJSON;
  canAddReaction: boolean;
  onAdd: (name: string, url?: string) => void;
  onRemove: (name: string) => void;
  style: AnimatedProps<HTMLAttributes<HTMLButtonElement>>['style'];
}

const Reaction: FC<ReactionProps> = ({
  reaction,
  canAddReaction,
  onAdd,
  onRemove,
  style,
}) => {
  const { name, url, static_url: staticUrl, me } = reaction;

  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    if (me) {
      onRemove(name);
      return;
    }

    // Do not attempt to add reactions with remote custom emojis
    // (their names are in the `shortcode@domain` form), as they
    // are not offered by the local instance.
    if (name.includes('@') || !canAddReaction) {
      return;
    }

    onAdd(name);
  }, [canAddReaction, me, name, onAdd, onRemove]);

  const isCustom = !!url;

  return (
    <animated.button
      type='button'
      className={classNames('reactions-bar__item', { active: me })}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {' '}
      <span className='reactions-bar__item__emoji'>
        {isCustom ? (
          <img
            draggable={false}
            className='emojione custom-emoji'
            alt={`:${name}:`}
            title={`:${name}:`}
            src={(autoPlayGif || hovered) && url ? url : staticUrl}
            loading='lazy'
          />
        ) : (
          <Emoji code={name} />
        )}
      </span>
      <span className='reactions-bar__item__count'>
        <AnimatedNumber value={reaction.count} />
      </span>
    </animated.button>
  );
};
