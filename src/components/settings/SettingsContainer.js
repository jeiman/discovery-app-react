import React, {PropTypes} from 'react'
import SettingsForm from './SettingsForm'
import {resetClient} from '../../services/contentfulClient'
import isPreviewSetInQuery from '../../utils/is-preview-set-in-query'
import ApiStore from '../../stores/ApiStore'

export default class SettingsContainer extends React.Component {
  constructor (props) {
    super(props)
    let q = this.props.location.query
    this.state = {
      space: q.space_id || '',
      deliveryAccessToken: q.delivery_access_token || '',
      previewAccessToken: q.preview_access_token || '',
      selectedApi: isPreviewSetInQuery(q) ? 'preview' : 'delivery',
      validationError: null
    }
  }
  loadSpace (event) {
    event.preventDefault()
    if (!this.state.space) {
      return this.showError('You need to provide a Space ID')
    } else if (this.previewSelected() && !this.state.previewAccessToken) {
      return this.showError('You need to provide a Preview API Access Token if you want to use the Preview API')
    } else if (!this.previewSelected() && !this.state.deliveryAccessToken) {
      return this.showError('You need to provide a Delivery API Access Token if you want to use the Delivery API')
    }
    resetClient()
    this.props.resetRequests()
    const query = {
      preview_access_token: this.state.previewAccessToken,
      delivery_access_token: this.state.deliveryAccessToken,
      preview: this.props.api.selectedApi === 'preview',
      space_id: this.state.space
    }
    if (this.previewSelected()) {
      query.preview = true
    }
    this.context.router.push({
      pathname: '/entries/by-content-type',
      query: query
    })
  }

  handleChange (event) {
    switch (event.target.id) {
      case 'space':
        this.setState({ space: event.target.value })
        break
      case 'deliveryAccessToken':
        this.setState({ deliveryAccessToken: event.target.value })
        break
      case 'previewAccessToken':
        this.setState({ previewAccessToken: event.target.value })
        break
    }
  }

  showError (message) {
    this.setState({ validationError: message })
  }

  handleAccessTokenChange (accessToken) {
    if (this.previewSelected()) {
      this.setState({
        previewAccessToken: accessToken,
        validationError: null
      })
    } else {
      this.setState({
        deliveryAccessToken: accessToken,
        validationError: null
      })
    }
  }

  previewSelected () {
    return ApiStore.get('isPreview')
  }

  render () {
    return <SettingsForm
      space={this.state.space}
      selectedAccessToken={this.previewSelected() ? this.state.previewAccessToken : this.state.deliveryAccessToken}
      deliveryAccessToken={this.state.deliveryAccessToken}
      previewAccessToken={this.state.previewAccessToken}
      selectedApi={this.state.selectedApi}
      handleChange={this.handleChange.bind(this)}
      loadSpace={this.loadSpace.bind(this)}
      validationError={this.state.validationError}
      />
  }
}
SettingsContainer.contextTypes = {
  router: PropTypes.object.isRequired
}
