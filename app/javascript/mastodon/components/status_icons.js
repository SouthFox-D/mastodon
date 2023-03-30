//  Package imports.
import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { defineMessages, injectIntl } from 'react-intl';

//  Mastodon imports.
import IconButton from './icon_button';
import Icon from './icon';
import { languages } from '../initial_state';

//  Messages for use with internationalization stuff.
const messages = defineMessages({
  collapse: { id: 'status.collapse', defaultMessage: 'Collapse' },
  uncollapse: { id: 'status.uncollapse', defaultMessage: 'Uncollapse' },
  inReplyTo: { id: 'status.in_reply_to', defaultMessage: 'This toot is a reply' },
  previewCard: { id: 'status.has_preview_card', defaultMessage: 'Features an attached preview card' },
  pictures: { id: 'status.has_pictures', defaultMessage: 'Features attached pictures' },
  poll: { id: 'status.is_poll', defaultMessage: 'This toot is a poll' },
  video: { id: 'status.has_video', defaultMessage: 'Features attached videos' },
  audio: { id: 'status.has_audio', defaultMessage: 'Features attached audio files' },
  localOnly: { id: 'status.local_only', defaultMessage: 'Only visible from your instance' },
});

const LanguageIcon = ({ language }) => {
  if (!languages) return null;

  const lang = languages.find((lang) => lang[0] === language);
  if (!lang) return null;

  return (
    <span className='text-icon' title={`${lang[2]} (${lang[1]})`} aria-hidden='true'>
      {lang[0].toUpperCase()}
    </span>
  );
};

LanguageIcon.propTypes = {
  language: PropTypes.string.isRequired,
};

class StatusIcons extends React.PureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    mediaIcons: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.object.isRequired,
  };

  mediaIconTitleText (mediaIcon) {
    const { intl } = this.props;

    switch (mediaIcon) {
      case 'window-restore':
        return intl.formatMessage(messages.previewCard);
      case 'picture-o':
        return intl.formatMessage(messages.pictures);
      case 'tasks':
        return intl.formatMessage(messages.poll);
      case 'video-camera':
        return intl.formatMessage(messages.video);
      case 'music':
        return intl.formatMessage(messages.audio);
    }
  }

  renderIcon (mediaIcon) {
    return (
      <Icon
        fixedWidth
        className='status__media-icon'
        key={`media-icon--${mediaIcon}`}
        id={mediaIcon}
        aria-hidden='true'
        title={this.mediaIconTitleText(mediaIcon)}
      />
    );
  }

  //  Rendering.
  render () {
    const {
      status,
      mediaIcons,
      intl,
    } = this.props;

    return (
      <div>
        {status.get('language') && <LanguageIcon language={status.get('language')} />}
        {status.get('in_reply_to_id', null) !== null ? (
          <Icon
            className='status__reply-icon'
            fixedWidth
            id='reply-all'
            aria-hidden='true'
            title={intl.formatMessage(messages.inReplyTo)}
          />
        ) : null}
        {!!mediaIcons && mediaIcons.map(icon => this.renderIcon(icon))}
      </div>
    );
  }

}

export default injectIntl(StatusIcons);
