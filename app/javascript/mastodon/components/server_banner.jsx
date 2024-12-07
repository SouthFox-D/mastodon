import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';

import { fetchServer } from 'mastodon/actions/server';
import { Account } from 'mastodon/components/account';
import { ServerHeroImage } from 'mastodon/components/server_hero_image';
import { ShortNumber } from 'mastodon/components/short_number';
import { Skeleton } from 'mastodon/components/skeleton';
import { domain } from 'mastodon/initial_state';

const messages = defineMessages({
  aboutActiveUsers: { id: 'server_banner.about_active_users', defaultMessage: 'People using this server during the last 30 days (Monthly Active Users)' },
});

const mapStateToProps = state => ({
  server: state.getIn(['server', 'server']),
});

class ServerBanner extends PureComponent {

  static propTypes = {
    server: PropTypes.object,
    dispatch: PropTypes.func,
    intl: PropTypes.object,
  };

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(fetchServer());
  }

  render () {
    const { server, intl } = this.props;
    const isLoading = server.get('isLoading');

    return (
      <div className='server-banner'>
        <div className='server-banner__introduction'>
          <FormattedMessage id='server_banner.is_one_of_many' defaultMessage='{domain} is one of the many independent Mastodon servers you can use to participate in the fediverse.' values={{ domain: <strong>{domain}</strong>, mastodon: <a href='https://joinmastodon.org' target='_blank'>Mastodon</a> }} />
        </div>

        <Link to='/about'>
          <ServerHeroImage blurhash={server.getIn(['thumbnail', 'blurhash'])} src={server.getIn(['thumbnail', 'url'])} className='server-banner__hero' />
        </Link>

        <div className='server-banner__description'>
          {isLoading ? (
            <>
              <Skeleton width='100%' />
              <br />
              <Skeleton width='100%' />
              <br />
              <Skeleton width='70%' />
            </>
          ) : server.get('description')}
        </div>

        <div className='server-banner__meta'>
          <div className='server-banner__meta__column'>
            <h4><FormattedMessage id='server_banner.administered_by' defaultMessage='Administered by:' /></h4>

            <Account id={server.getIn(['contact', 'account', 'id'])} size={36} minimal />
          </div>

        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(ServerBanner));
