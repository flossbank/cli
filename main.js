const React = require('react')
const PropTypes = require('prop-types')
const { spawn } = require('child_process')
const wrap = require('./lib/wrap')
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
			output: []
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
		// const res = await fetch('https://npmc-api-test.joelwasserman.now.sh/api/ad')
		// const json = await res.json()
		// const { url, title, body } = json
		const messages = [
			{ // for testing
				"title": "LogRocket",
				"body": "Stop guessing why bugs happen. LogRocket lets you replay what users do on your web app or website, helping you reproduce bugs and fix issues faster.",
				"url": "https://logrocket.com/term"
			},
			{ // for testing
				"title": "Hello Peter",
				"body": "Donate to teacherfund and get a free t shirt today!",
				"url": "https://theteacherfund.com/term"
			},
			{ // for testing
				"title": "Trump sucks",
				"body": "blahhhhhh!",
				"url": "https://theteacherfund.com/term"
			}
		]
		let { url, title, body } = messages[Math.floor(Math.random() * 3)]

		const adWidth = termSize().columns / 2
		const topBorder = `┌${'─'.repeat(adWidth)}┐`
		const bottomBorder = `└${'─'.repeat(adWidth)}┘`

		const colors = [
			'#FF5733', // redish
			'#D4AC0D', // yellowish
			'#633974', // dark purple
			'#3498DB', // blue
			'#FBFCFC', // off white
		]

		const topBorderColor = colors[Math.floor(Math.random() * (colors.length - 1))]
		const bottomBorderColor = colors[Math.floor(Math.random() * (colors.length - 1))]

		const bodyPutOnMultipleLines = wrap(body)
		const splitBody = bodyPutOnMultipleLines.split('\n')

		// const maxBodyWidth = adWidth - 10
		// const bodyLineCount = body.length / maxBodyWidth
		const bodyLines = []
		for (let i = 0; i < splitBody.length; i++) {
			bodyLines.push(<Text>{splitBody[i]}</Text>)
		}

		this.setState({ ad: (
				<Box flexDirection="column" 
					width={adWidth} 
					alignItems="center"
					padding={1}>
					<Color hex={topBorderColor}>{topBorder}</Color>
					<Text bold>{title}</Text>
					{bodyLines}
					<Text> </Text>
					<Text underline>{url}</Text>
					<Color hex={bottomBorderColor}>{bottomBorder}</Color>
				</Box>
			)
		})
	}

	updateOutput (chunk) {
		this.setState(({ output }) => ({ output: output.concat(chunk) }))
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
						<Box width="100%" justifyContent="center">
					<Box>
						{this.state.ad}
					</Box>
				</Box>
			</Box>
		)
	}
}

App.propTypes = {
	args: PropTypes.arrayOf(PropTypes.string)
}

module.exports = App
