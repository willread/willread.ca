import { useState } from 'react';

import './tools.scss';
import Layout from '../../components/Layout';
import CodeBlock from '../../components/CodeBlock';

export default function DottedUnderlines() {
  const [color, setColor] = useState('#000');
  const [dashWidth, setDashWidth] = useState(4);
  const [spaceWidth, setSpaceWidth] = useState(2);
  const [thickness, setThickness] = useState(2);
  const [padding, setPadding] = useState(3);

  const code =
`.underline {
  background: linear-gradient(90deg, ${color} 0, ${color} ${dashWidth}px, transparent ${dashWidth}px, transparent 100%) bottom left / ${dashWidth + spaceWidth}px ${thickness}px repeat-x;
  display: inline-block;
  padding-bottom: ${padding}px;
}`;

  return (
    <Layout>
      <section className="tool">
        <div className="description block">
          A useful technique for creating dashed / dotted underlines using css gradients for when you need precise control over the size / spacing of the dashes.
        </div>

        <h2>Settings</h2>

        <div className="form block">
          <div className="row">
            <label>Color</label>
            <input type="text" onInput={e => setColor((e.target as HTMLInputElement).value)} value={color}></input>
          </div>
          <div className="row">
            <label>Dash Width ({dashWidth}px)</label>
            <input type="range" min="1" max="20" onInput={e => setDashWidth(parseInt((e.target as HTMLInputElement).value))} value={dashWidth}></input>
          </div>
          <div className="row">
            <label>Space Width ({spaceWidth}px)</label>
            <input type="range" min="1" max="20" onInput={e => setSpaceWidth(parseInt((e.target as HTMLInputElement).value))} value={spaceWidth}></input>
          </div>
          <div className="row">
            <label>Thickness ({thickness}px)</label>
            <input type="range" min="1" max="20" onInput={e => setThickness(parseInt((e.target as HTMLInputElement).value))} value={thickness}></input>
          </div>
          <div className="row">
            <label>Padding ({padding}px)</label>
            <input type="range" min="1" max="20" onInput={e => setPadding(parseInt((e.target as HTMLInputElement).value))} value={padding}></input>
          </div>
        </div>

        <h2>Preview</h2>

        <div className="preview">
          <a className="underline">This is some text with an underline</a>
        </div>

        <h2>CSS</h2>

        <div className="code">
          <CodeBlock>
            { code }
          </CodeBlock>
        </div>

        <style>
          { code }
        </style>
      </section>
    </Layout>
  );
}