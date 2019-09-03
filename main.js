const React = require('react')
const PropTypes = require('prop-types')
const { spawn } = require('child_process')
const { 
	getRandomColor, 
	getAdBody,
} = require('./lib/adHelpers')
const testAds = require('./testData/testAds.json')
const { Box, Text, Color } = require('ink')
const { default: Spinner } = require('ink-spinner')
const fetch = require('node-fetch')
const termSize = require('term-size')

class App extends React.Component {
	constructor (props) {
		super(props)

		const { command, args } = this.getChildCmd()

		this.state = {
			ad: this.getTempAd(),
			command,
			args,
			output: [],
			message: []
		}

		this.updateOutput = this.updateOutput.bind(this)
	}

	componentDidMount () {
		// kick off ad fetching
		this.getAd()
		const adInterval = setInterval(() => this.getAd(), 2000)

		// kick off child command
		const child = spawn(this.state.command, this.state.args)	
		child.stdout.on('data', this.updateOutput)
		child.stderr.on('data', this.updateOutput)
		child.on('close', () => {
			clearInterval(adInterval)
		})
	}

	getTempAd () {
		return (
			<Text>
				{'\n'}
			</Text>
		)
	}

	async getAd () {
		// fetch ad and format properly
		let url, title, body
		if (process.env.NODE_ENV === 'production') {
			const res = await fetch('http://localhost:3000/api/getAd')
			const json = await res.json()
			({ url, title, body } = json)
		} else {
			({ url, title, body } = testAds[Math.floor(Math.random() * 3)])
		}

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
				<Box width="100%" justifyContent="center">
					<Box>
						{this.state.ad}
					</Box>
				</Box>
				<Box paddingY={1} width="100%" flexDirection="column">
					<Text>
						{this.state.output.length
							? this.state.output.join('')
							: <Spinner type="dots" />
						}
					</Text>
				</Box>
			</Box>
		)
	}
}

App.propTypes = {
	args: PropTypes.arrayOf(PropTypes.string)
}

module.exports = App
