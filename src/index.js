import React from 'react'
import ReactDOM from 'react-dom'
import useSWR from 'swr'
import './index.css'
import 'animate.css'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

function useUser(id) {
  const { data, error } = useSWR(
    `http://jsonplaceholder.typicode.com/users/${id}`,
    fetcher
  )
  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  }
}

function UserPage2() {
  const { user, isLoading } = useUser(1)
  if (isLoading) return 'Loading'
  return <span>Welcome back, {user.name}</span>
}

function UserPage() {
  return (
    <h1>
      <Name /> <Content />
    </h1>
  )
}
// child components
function Name() {
  const { user, isLoading } = useUser(1)
  if (isLoading) return 'Loading'
  return <span>Welcome back, {user.name}</span>
}
function Content() {
  const { user, isLoading } = useUser(1)
  if (isLoading) return 'Loading'
  return <small>({user.email})</small>
}

function Square(props) {
  return (
    <button
      className={props.isActive ? 'square active' : 'square'}
      onClick={() => props.onClick()}
    >
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    )
  }
  renderSquareArea() {
    const result = []
    let aLineSquares = []
    for (let i = 0; i < this.props.boardSize * this.props.boardSize; i++) {
      aLineSquares.push(
        <Square
          key={i}
          value={this.props.squares[i]}
          isActive={
            this.props.winnerGroup && this.props.winnerGroup.includes(i)
          }
          onClick={() => this.props.onClick(i)}
        />
      )
      if (aLineSquares.length === this.props.boardSize) {
        result.push(
          <div key={i} className="board-row">
            {aLineSquares}
          </div>
        )
        aLineSquares = []
      }
    }
    return result
  }

  render() {
    return <div>{this.renderSquareArea()}</div>
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      historySort: 'desc',
      history: [
        {
          squares: Array(9).fill(null),
          i: null,
        },
      ],
      xIsNext: true,
      stepNumber: 0,
      boardSize: 3,
    }

    this.handleChangeBoardSize = this.handleChangeBoardSize.bind(this)
    this.handleChangeHistorySort = this.handleChangeHistorySort.bind(this)
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1)
    const current = history[history.length - 1]
    const squares = current.squares.slice()
    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O'
    this.setState({
      history: history.concat([
        {
          squares,
          i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  jumpTo(index) {
    this.setState({
      stepNumber: index,
      xIsNext: index % 2 === 0,
    })
  }

  handleChangeBoardSize(event) {
    this.setState({ boardSize: Number(event.target.value) })
  }

  handleChangeHistorySort(event) {
    this.setState({ historySort: event.target.value })
  }

  render() {
    const history = this.state.history
    const current = history[this.state.stepNumber]
    const winner = calculateWinner(current.squares)
    const inHistory = this.state.stepNumber < history.length - 1

    let moves = history.map((step, index) => {
      const desc = index ? 'Go to move #' + index : 'Go to game start'
      const lineNum =
        (step.i + 1) % this.state.boardSize === 0
          ? this.state.boardSize
          : (step.i + 1) % this.state.boardSize
      const columnNum = Math.ceil((step.i + 1) / this.state.boardSize)

      return (
        <li key={index}>
          <button
            style={{
              fontWeight:
                inHistory && this.state.stepNumber === index
                  ? 'bold'
                  : 'inherit',
            }}
            onClick={() => this.jumpTo(index)}
          >
            {desc}
            {step.i !== null ? `—— ${lineNum}/${columnNum}` : ''}
          </button>
        </li>
      )
    })
    if (this.state.historySort === 'asc') {
      moves = moves.reverse()
    }

    let status
    if (winner) {
      status = winner.draw ? 'DRAW' : 'Winner: ' + winner.player
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
    }

    return (
      <div className="game">
        <div className="game-info">
          <div>
            <span
              style={{ display: 'inline-block' }}
              className={
                winner
                  ? 'animate__animated animate__infinite animate__heartBeat font-bold'
                  : ''
              }
            >
              {status}
            </span>
          </div>
          <div>
            Board Size（TODO：改成五子棋）：
            <input
              type="number"
              onChange={this.handleChangeBoardSize}
              value={this.state.boardSize}
            />
          </div>
          <div>
            History Sort：
            <label>
              <input
                type="radio"
                name="sort"
                onChange={this.handleChangeHistorySort}
                value="desc"
                checked={this.state.historySort === 'desc'}
              />{' '}
              desc
            </label>
            <label>
              <input
                type="radio"
                name="sort"
                onChange={this.handleChangeHistorySort}
                value="asc"
                checked={this.state.historySort === 'asc'}
              />{' '}
              asc
            </label>
          </div>
          <ol>{moves}</ol>
        </div>
        <div className="game-board" style={{ marginLeft: '5px' }}>
          <Board
            winnerGroup={winner && winner.group}
            boardSize={this.state.boardSize}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
      </div>
    )
  }
}

// ========================================

ReactDOM.render(
  <>
    <UserPage />
    <UserPage2 />
    <Game />
  </>,
  document.getElementById('root')
)

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        player: squares[a],
        group: lines[i],
      }
    }
  }

  // 平局
  if (squares.every((e) => e !== null)) {
    return {
      draw: true,
    }
  }
  return null
}
