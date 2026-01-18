import { css } from '../../styled-system/css'

export function Example() {
  return (
    <div
      className={css({
        padding: '4',
        backgroundColor: 'blue.100',
        borderRadius: 'md',
        color: 'blue.900',
        fontSize: 'lg',
        fontWeight: 'bold',
      })}
    >
      <h2>Example Component</h2>
      <p>This is an example component using Panda CSS styling.</p>
    </div>
  )
}
