const React = require('react')
const PropTypes = require('prop-types')
const { spawn } = require('child_process')
const { Box, Text, Color } = require('ink')
const { default: Spinner } = require('ink-spinner')
const termSize = require('term-size')
const fetch = require('node-fetch')

class App extends React.Component {
	constructor (props) {
		super(props)

		const { command, args } = this.getChildCmd()

		this.state = {
			ad: this.getTempAd(),
			command,
			args,
			stdout: [],
			stderr: []
		}

		this.maxHeight = termSize().rows
		this.maxWidth = termSize().columns

		// reserve 20% of term for cmd output; 20% of term for ad output
		this.maxAdHeight = Math.floor(0.20 * this.maxHeight)
		this.maxOutput = Math.floor(0.20 * this.maxHeight)
		this.maxAllOutput = this.maxAdHeight + this.maxOutput

		this.updateStdout = this.updateStdout.bind(this)
		this.updateStderr = this.updateStderr.bind(this)
	}

	componentDidMount () {
		// kick off ad fetching
		this.getAd()

		// kick off child command
		const child = spawn(this.state.command, this.state.args)
		child.stdout.on('data', this.updateStdout)
		child.stderr.on('data', this.updateStderr)
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
		const res = await fetch('https://npmc-api-test.joelwasserman.now.sh/api/ad')
		const json = await res.json()
		const { url, title, body } = json

		this.setState({ ad: (
				<Box flexDirection="column" padding={1}>
					<Text bold>{title}</Text>
					<Text>{body}</Text>
					<Text blue>{url}</Text>
				</Box>
			)
		})
	}

	updateStdout (chunk) {
		const { stdout } = this.state
		const nextStdout = stdout.slice()
		nextStdout.unshift(chunk)
		this.setState({ stdout: nextStdout })
	}

	updateStderr (chunk) {
		const { stderr } = this.state
		const nextStderr = stderr.slice()
		nextStderr.unshift(chunk)
		this.setState({ stderr: nextStderr })
	}

	getChildCmd () {
		const [command, ...args] = this.props.args
		return { command, args }
	}

	render () {
		return (
			<Box paddingY={2} flexDirection="column" height={this.maxAllOutput}>
				<Box width="100%" height={this.maxAdHeight} justifyContent="center">
            <Box>
                {this.state.ad}
            </Box>
        </Box>
        <Box paddingY={1} width="100%" flexDirection="column">
					<Text>
						{this.state.stdout.length
							? this.state.stdout.slice(0, this.maxOutput).reverse().join('')
							: <Spinner type="dots" />
						}
					</Text>
					<Text><Color red>{this.state.stderr.join('\n')}</Color></Text>
				</Box>
    	</Box>
		)
	}
}

App.propTypes = {
	args: PropTypes.arrayOf(PropTypes.string)
}

module.exports = App
