const React = require('react')
const PropTypes = require('prop-types')
const { spawn } = require('child_process')
const { Box, Text, Color } = require('ink')
const { default: Spinner } = require('ink-spinner')
const fetch = require('node-fetch')
const termSize = require('term-size')
const {
	getRandomColor,
	getAdBody,
} = require('./lib/adHelpers')
const { INTERVAL } = require('./lib/constants')
const defaultAds = require('./data/defaultAds.json')

class App extends React.Component {
	constructor (props) {
		super(props)

		const { command, args } = this.getChildCmd()

		this.state = {
			ad: null,
			command,
			args,
			output: [],
			message: []
		}

		this.updateOutput = this.updateOutput.bind(this)
	}

	componentDidMount () {
		// kick off ad fetching
		this.getAds()

		// kick off child command
		const child = spawn(this.state.command, this.state.args)
		child.stdout.on('data', this.updateOutput)
		child.stderr.on('data', this.updateOutput)
		child.on('close', (code) => {
			process.exit(code)
		})
	}

	async getAds () {
		await this.fetchAd()
		setTimeout(() => this.getAds(), INTERVAL)
	}

	getRandomDefaultAd () {
		return defaultAds[Math.floor(Math.random() * 3)]
	}

	async fetchAd () {
		// fetch ad and format properly
		let json = {}
		if (process.env.NODE_ENV === 'production') {
			try {
				const res = await fetch('http://localhost:3000/api/getAd')
				json = await res.json()
			} catch (e) {
				json = this.getRandomDefaultAd()
			}
		} else {
			json = this.getRandomDefaultAd()
		}
		const { url, title, body } = json

		const adWidth = termSize().columns / 2
		const topBorder = `┌${'─'.repeat(adWidth)}┐`
		const bottomBorder = `└${'─'.repeat(adWidth)}┘`

		const borderColor = getRandomColor()
		const splitBody = getAdBody(body)
		const bodyLines = []
		for (let i = 0; i < splitBody.length; i++) {
			bodyLines.push(<Text>{splitBody[i]}</Text>)
		}

		this.setState({ ad: (
				<Box flexDirection="column" 
					width={adWidth} 
					alignItems="center"
					padding={1}>
					<Color hex={borderColor}>{topBorder}</Color>
					<Text bold>{title}</Text>
					{bodyLines}
					<Text> </Text>
					<Text underline>{url}</Text>
					<Color hex={borderColor}>{bottomBorder}</Color>
				</Box>
			)
		})
	}

	updateOutput (chunk) {
		this.setState(({ output }) => ({ output: output.concat(chunk) }))
	}

	updateMessage (chunk) {	
		this.setState(({ message }) => ({ message: message.concat(chunk) }))
	}

	getChildCmd () {
		const [command, ...args] = this.props.args
		return { command, args }
	}

	render () {
		return (
			<Box paddingY={2} flexDirection="column">
				<Box paddingY={1} width="100%" flexDirection="column">
					<Text>
						{this.state.output.length
							? this.state.output.join('')
							: <Spinner type="dots" />
						}
					</Text>
				</Box>
				{this.state.ad && (
				<Box width="100%" justifyContent="center">
					<Box>
						{this.state.ad}
					</Box>
				</Box>
				)}
			</Box>
		)
	}
}

App.propTypes = {
	args: PropTypes.arrayOf(PropTypes.string)
}

module.exports = App
