const React = require('react')
const PropTypes = require('prop-types')
const { spawn } = require('child_process')
const { Box, Text, Color } = require('ink')
const { default: Spinner } = require('ink-spinner')
const fetch = require('node-fetch')

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

		// kick off child command
		const child = spawn(this.state.command, this.state.args)
		child.stdout.on('data', this.updateOutput)
		child.stderr.on('data', this.updateOutput)
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
