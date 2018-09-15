import React from 'react';
import { Header, Modal, Statistic, Grid, Responsive, Table } from 'semantic-ui-react';
import { map } from 'lodash';
import TrainBullet from './trainBullet.jsx';

class LineModal extends React.Component {
  state = {}

  handleOnUpdate = (e, { width }) => this.setState({ width })

  color() {
    if (this.props.line.status == 'Good Service') {
      return 'green';
    } else if (this.props.line.status == 'Not Good') {
      return 'red';
    }
  }

  tableData() {
    const north = this.props.line.north;
    let data = this.props.line.south.map((obj, index) => {
      let northType = north.find((nObj) => {
        return obj.type === nObj.type;
      });
      let routes = obj.routes;
      if (northType) {
        routes = routes.concat(northType.routes.filter((r) => {
          return routes.every((route) => {
            return r.name !== route.name
          });
        }));
      }
      return {
        type: obj.type || "Local",
        routes: routes,
        southActual: obj.max_actual_headway,
        southScheduled: obj.max_scheduled_headway,
        northActual: northType && northType.max_actual_headway,
        northScheduled: northType && northType.max_scheduled_headway
      }
    });
    north.forEach((obj) => {
      let match = data.find((el) => {
        let type = obj.type || "Local";
        return el.type === type;
      });
      if (!match) {
        data.push({
          type: obj.type || "Local",
          routes: obj.routes,
          northActual: obj.max_actual_headway,
          northScheduled: obj.max_scheduled_headway
        });
      }
    });

    return data.map((obj) => {
      const southError = obj.southScheduled && (obj.southActual - obj.southScheduled > 2)
      const northError = obj.northScheduled && (obj.northActual - obj.northScheduled > 2)
      return (
        <Table.Row key={obj.type}>
          <Table.Cell>
            { (obj.southActual || obj.southActual === 0) &&
              <Statistic size='small' horizontal inverted color={southError ? "red" : "black"}>
                <Statistic.Value>{obj.southActual}</Statistic.Value>
                <Statistic.Label>Mins</Statistic.Label>
              </Statistic>
            }
          </Table.Cell>
          <Table.Cell>
            { (obj.southActual || obj.southActual === 0) &&
              <Statistic size='small' horizontal inverted color={southError ? "red" : "black"}>
                <Statistic.Value>{obj.southScheduled || "--"}</Statistic.Value>
                <Statistic.Label>Mins</Statistic.Label>
              </Statistic>
            }
          </Table.Cell>
          <Table.Cell>
            <h5 style={{display: "inline-block"}}>
              {obj.type}
            </h5>
            {
              map(obj.routes, route => {
                return <TrainBullet key={route.name} name={route.name} color={route.color} textColor={route.text_color} size='small' />
              })
            }
          </Table.Cell>
          <Table.Cell>
            { (obj.northActual || obj.northActual === 0) &&
              <Statistic size='small' horizontal inverted color={northError ? "red" : "black"}>
                <Statistic.Value>{obj.northActual}</Statistic.Value>
                <Statistic.Label>Mins</Statistic.Label>
              </Statistic>
            }
          </Table.Cell>
          <Table.Cell>
            { (obj.northActual || obj.northActual === 0) &&
              <Statistic size='small' horizontal inverted color={northError ? "red" : "black"}>
                <Statistic.Value>{obj.northScheduled || "--"}</Statistic.Value>
                <Statistic.Label>Mins</Statistic.Label>
              </Statistic>
            }
          </Table.Cell>
        </Table.Row>
      )
    });
  }

  tableDataMobileSouth() {
    let data = this.props.line.south.map((obj, index) => {
      return {
        type: obj.type || "Local",
        routes: obj.routes,
        southActual: obj.max_actual_headway,
        southScheduled: obj.max_scheduled_headway,
      }
    });

    return data.map((obj) => {
      const southError = obj.southScheduled && (obj.southActual - obj.southScheduled > 2)
      return (
        <Table.Row key={obj.type}>
          <Table.Cell>
            <Statistic size='small' inverted color={southError ? "red" : "black"}>
              <Statistic.Value>{obj.southActual}</Statistic.Value>
              <Statistic.Label>Mins</Statistic.Label>
            </Statistic>
          </Table.Cell>
          <Table.Cell>
            <Statistic size='small' inverted color={southError ? "red" : "black"}>
              <Statistic.Value>{obj.southScheduled || "--"}</Statistic.Value>
              <Statistic.Label>Mins</Statistic.Label>
            </Statistic>
          </Table.Cell>
          <Table.Cell>
            <h5>
              {obj.type}
            </h5>
            {
              map(obj.routes, route => {
                return <TrainBullet key={route.name} name={route.name} color={route.color} textColor={route.text_color} size='small' />
              })
            }
          </Table.Cell>
        </Table.Row>
      )
    });
  }

  tableDataMobileNorth() {
    let data = this.props.line.north.map((obj, index) => {
      return {
        type: obj.type || "Local",
        routes: obj.routes,
        northActual: obj.max_actual_headway,
        northScheduled: obj.max_scheduled_headway,
      }
    });

    return data.map((obj) => {
      const northError = obj.northScheduled && (obj.northActual - obj.northScheduled > 2)
      return (
        <Table.Row key={obj.type}>
          <Table.Cell>
            <h5>
              {obj.type}
            </h5>
            {
              map(obj.routes, route => {
                return <TrainBullet key={route.name} name={route.name} color={route.color} textColor={route.text_color} size='small' />
              })
            }
          </Table.Cell>
          <Table.Cell>
            <Statistic size='small' inverted color={northError ? "red" : "black"}>
              <Statistic.Value>{obj.northActual}</Statistic.Value>
              <Statistic.Label>Mins</Statistic.Label>
            </Statistic>
          </Table.Cell>
          <Table.Cell>
            <Statistic size='small' inverted color={northError ? "red" : "black"}>
              <Statistic.Value>{obj.northScheduled || "--"}</Statistic.Value>
              <Statistic.Label>Mins</Statistic.Label>
            </Statistic>
          </Table.Cell>
        </Table.Row>
      )
    });
  }

  render() {
    const { width } = this.state;
    return(
      <Responsive as={Modal} basic fireOnMount onUpdate={this.handleOnUpdate} trigger={this.props.trigger} closeIcon dimmer="blurring" closeOnDocumentClick closeOnDimmerClick>
        <Modal.Header>
          {this.props.line.name}
          {
            map(this.props.line.routes, route => {
              return <TrainBullet key={route.name} name={route.name} color={route.color} textColor={route.text_color} size='small' />
            })
          }
        </Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Grid textAlign='center'>
              <Grid.Column>
              <Statistic.Group widths={1} size={(width > Responsive.onlyMobile.maxWidth) ? "small" : "tiny"} color={this.color()} inverted>
                <Statistic>
                  <Statistic.Value>{this.props.line.status}</Statistic.Value>
                  <Statistic.Label>Status</Statistic.Label>
                </Statistic>
              </Statistic.Group>
                <Responsive as={Table} fixed textAlign='center' minWidth={Responsive.onlyMobile.maxWidth} inverted>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan='2' width={4}>
                        <h4>
                          To {this.props.line.destinations.south.join(', ').replace(/ - /g, "-") || "--"}
                        </h4>
                      </Table.HeaderCell>
                      <Table.HeaderCell rowSpan='2' width={5}>
                        <h4>
                          Service
                        </h4>
                      </Table.HeaderCell>
                      <Table.HeaderCell colSpan='2' width={4}>
                        <h4>
                          To {this.props.line.destinations.north.join(', ').replace(/ - /g, "-") || "--"}
                        </h4>
                      </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell width={2}>
                        Actual<br />
                        Frequency
                      </Table.HeaderCell>
                      <Table.HeaderCell width={2}>
                        Scheduled<br />
                        Frequency
                      </Table.HeaderCell>
                      <Table.HeaderCell width={2}>
                        Actual<br />
                        Frequency
                      </Table.HeaderCell>
                      <Table.HeaderCell width={2}>
                        Scheduled<br />
                        Frequency
                      </Table.HeaderCell>
                    </Table.Row>
                    { this.tableData() }
                  </Table.Header>
                </Responsive>
                <Responsive as={Table} fixed textAlign='center' maxWidth={Responsive.onlyMobile.maxWidth} unstackable inverted>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan='3' width={16}>
                        To {this.props.line.destinations.south.join(', ').replace(/ - /g, "-") || "--"}
                      </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell width={5}>
                        Actual<br />
                        Frequency
                      </Table.HeaderCell>
                      <Table.HeaderCell width={5}>
                        Scheduled<br />
                        Frequency
                      </Table.HeaderCell>
                      <Table.HeaderCell width={6}>
                        Service
                      </Table.HeaderCell>
                    </Table.Row>
                    { this.tableDataMobileSouth() }
                  </Table.Header>
                </Responsive>
                <Responsive as={Table} fixed textAlign='center' maxWidth={Responsive.onlyMobile.maxWidth} unstackable inverted>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan='3' width={16}>
                        To {this.props.line.destinations.north.join(', ').replace(/ - /g, "-") || "--"}
                      </Table.HeaderCell>
                    </Table.Row>
                    <Table.Row>
                      <Table.HeaderCell width={6}>
                        Service
                      </Table.HeaderCell>
                      <Table.HeaderCell width={5}>
                        Actual<br />
                        Frequency
                      </Table.HeaderCell>
                      <Table.HeaderCell width={5}>
                        Scheduled<br />
                        Frequency
                      </Table.HeaderCell>
                    </Table.Row>
                    { this.tableDataMobileNorth() }
                  </Table.Header>
                </Responsive>
              </Grid.Column>
            </Grid>
          </Modal.Description>
        </Modal.Content>
      </Responsive>
    )
  }
}
export default LineModal